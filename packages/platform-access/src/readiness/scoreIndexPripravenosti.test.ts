import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

import {
  AUDIT_LAND_QUESTION_ID,
  AUDIT_LAND_SEARCHING_PLOT,
  prioritySupplementaryQuestionId,
} from '../operations/decisionSignalCatalog';
import { parseGalleryCsv } from './parseGalleryCsv';
import type { ReadinessCatalog, ReadinessEvent } from './readinessTypes';
import {
  displayIndexPripravenosti,
  scoreIndexPripravenosti,
} from './scoreIndexPripravenosti';

const BUNGALOV_ROOMS = [
  'exterior',
  'kitchen',
  'living-room',
  'vestibule',
  'wardrobe',
  'bedroom',
  'bathroom',
  'toilet',
  'children-room',
  'office',
  'technical-room',
] as const;

const BUNGALOV_IMAGES = parseGalleryCsv(`order,room,file
1,exterior,01.webp
2,exterior,02.webp
3,exterior,03.webp
4,kitchen,11.webp
5,living-room,12.webp
6,vestibule,13.webp
7,wardrobe,14.webp
8,bedroom,15.webp
9,bedroom,16.webp
10,bathroom,17.webp
11,toilet,18.webp
12,children-room,19.webp
13,children-room,20.webp
14,office,21.webp
15,office,22.webp
16,technical-room,13.webp
`);

const BUNGALOV_CATALOG: ReadinessCatalog = {
  roomIds: BUNGALOV_ROOMS,
  imageIds: BUNGALOV_IMAGES,
};

function at(event: Omit<ReadinessEvent, 'at'>, time: number): ReadinessEvent {
  return { ...event, at: time };
}

function score(
  events: readonly ReadinessEvent[],
  options: {
    readonly qualifiedLead?: boolean;
    readonly catalog?: ReadinessCatalog;
  } = {},
) {
  return scoreIndexPripravenosti({
    events,
    catalog: options.catalog ?? BUNGALOV_CATALOG,
    qualifiedLead: options.qualifiedLead ?? false,
  });
}

function room(id: string, time: number): ReadinessEvent {
  return at({ type: 'RoomSelected', roomId: id }, time);
}

function image(id: string, time: number): ReadinessEvent {
  return at({ type: 'ImageViewed', mediaId: id }, time);
}

function faq(id: string, time: number): ReadinessEvent {
  return at({ type: 'QuestionOpened', questionId: id }, time);
}

function chat(id: string, time: number): ReadinessEvent {
  return at({ type: 'ChatQuestionSubmitted', questionId: id }, time);
}

function land(time: number): ReadinessEvent {
  return at(
    {
      type: 'QuestionAnswered',
      questionId: AUDIT_LAND_QUESTION_ID,
      answerId: AUDIT_LAND_SEARCHING_PLOT,
    },
    time,
  );
}

function answers(
  ids: readonly string[],
  time: number,
): readonly ReadinessEvent[] {
  return ids.map((id, index) =>
    at(
      {
        type: 'QuestionAnswered',
        questionId: prioritySupplementaryQuestionId(id),
        answerId: 'option',
      },
      time + index,
    ),
  );
}

function priorities(
  ids: readonly string[],
  intensities: readonly number[],
  time: number,
): ReadinessEvent {
  return at(
    {
      type: 'PriorityChanged',
      priorityIds: ids,
      intensities: ids.map((id, index) => ({
        priorityId: id,
        importance: intensities[index] ?? 0,
      })),
    },
    time,
  );
}

describe('Index připravenosti scoring engine', () => {
  it('VIDEO first start / 50% / completion / replay / technical duplicate', () => {
    assert.equal(
      score([
        at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 1),
      ]).breakdown.video,
      0.5,
    );
    assert.equal(
      score([
        at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 1),
        at(
          {
            type: 'VideoPlaybackMilestone',
            mediaId: 'tour-video',
            milestone: 'half',
          },
          2,
        ),
      ]).breakdown.video,
      1,
    );
    assert.equal(
      score([
        at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 1),
        at(
          {
            type: 'VideoPlaybackMilestone',
            mediaId: 'tour-video',
            milestone: 'half',
          },
          2,
        ),
        at(
          {
            type: 'VideoPlaybackMilestone',
            mediaId: 'tour-video',
            milestone: 'end',
          },
          3,
        ),
      ]).breakdown.video,
      1.5,
    );
    assert.equal(
      score([
        at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 1),
        at(
          {
            type: 'VideoPlaybackMilestone',
            mediaId: 'tour-video',
            milestone: 'half',
          },
          2,
        ),
        at(
          {
            type: 'VideoPlaybackMilestone',
            mediaId: 'tour-video',
            milestone: 'end',
          },
          3,
        ),
        at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 10_000),
      ]).breakdown.video,
      3.5,
    );
    assert.equal(
      score([
        at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 1),
        at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 200),
      ]).breakdown.video,
      0.5,
    );
  });

  it('IMAGES unique / all / genuine repeat / rerender', () => {
    assert.equal(
      score([image('exterior/01.webp', 1)]).breakdown.images,
      0.1,
    );
    assert.equal(
      score([
        image('exterior/01.webp', 1),
        image('exterior/02.webp', 2),
        image('kitchen/11.webp', 3),
      ]).breakdown.images,
      0.3,
    );
    const allImages = BUNGALOV_IMAGES.map((id, index) => image(id, index + 1));
    assert.equal(score(allImages).breakdown.images, 16 * 0.1 + 2);
    assert.equal(
      score([
        image('exterior/01.webp', 1),
        image('exterior/02.webp', 2),
        image('exterior/01.webp', 3),
      ]).breakdown.images,
      0.2 + 0.5,
    );
    assert.equal(
      score([
        image('exterior/01.webp', 1),
        image('exterior/01.webp', 2),
      ]).breakdown.images,
      0.1,
    );
  });

  it('ROOMS unique / all / technical duplicate', () => {
    assert.equal(score([room('kitchen', 1)]).breakdown.rooms, 1);
    assert.equal(
      score([room('kitchen', 1), room('bedroom', 2)]).breakdown.rooms,
      2,
    );
    assert.equal(
      score(BUNGALOV_ROOMS.map((id, index) => room(id, index + 1))).breakdown
        .rooms,
      13,
    );
    assert.equal(
      score([room('kitchen', 1), room('kitchen', 2)]).breakdown.rooms,
      1,
    );
  });

  it('TOUR RETURN ignores internal TOUR and scores genuine later return', () => {
    assert.equal(
      score([
        at({ type: 'JourneyStageEntered', stageId: 'tour' }, 1),
        room('kitchen', 2),
        image('kitchen/11.webp', 3),
        at({ type: 'JourneyStageEntered', stageId: 'tour' }, 4),
      ]).breakdown.tourReturns,
      0,
    );
    assert.equal(
      score([
        at({ type: 'JourneyStageEntered', stageId: 'tour' }, 1),
        at({ type: 'JourneyStageEntered', stageId: 'priority' }, 2),
        at({ type: 'JourneyStageEntered', stageId: 'tour' }, 3),
      ]).breakdown.tourReturns,
      5,
    );
  });

  it('PRIORITIES selection / intensity / later revision / slider burst', () => {
    assert.equal(
      score([
        priorities(['quality'], [0.8], 1),
      ]).breakdown.priorities,
      2,
    );
    assert.equal(
      score([
        priorities(['quality', 'layout'], [0.8, 0.5], 1),
      ]).breakdown.priorities,
      4,
    );
    assert.equal(
      score([
        priorities(['quality', 'layout', 'maintenance'], [0.8, 0.5, 0.27], 1),
      ]).breakdown.priorities,
      9,
    );
    assert.equal(
      score([
        priorities(
          ['quality', 'layout', 'maintenance', 'energy'],
          [0.8, 0.5, 0.27, 0.4],
          1,
        ),
      ]).breakdown.priorities,
      12,
    );
    assert.equal(
      score([
        priorities(['quality', 'layout', 'maintenance'], [0.8, 0.5, 0.27], 1),
        priorities(['quality', 'layout', 'maintenance'], [0.9, 0.5, 0.27], 2000),
      ]).breakdown.priorities,
      12,
    );
    assert.equal(
      score([
        priorities(['layout'], [0.5], 1),
        priorities(['quality', 'layout', 'maintenance'], [0.8, 0.5, 0.27], 2000),
      ]).breakdown.priorities,
      9,
    );
    assert.equal(
      score([
        priorities(['quality', 'layout', 'maintenance'], [0.1, 0.5, 0.27], 1),
        priorities(['quality', 'layout', 'maintenance'], [0.2, 0.5, 0.27], 50),
        priorities(['quality', 'layout', 'maintenance'], [0.8, 0.5, 0.27], 80),
      ]).breakdown.priorities,
      9,
    );
  });

  it('FAQ unique opens only', () => {
    assert.equal(score([faq('q-1', 1)]).breakdown.faq, 0.5);
    assert.equal(
      score([
        faq('q-1', 1),
        faq('q-2', 2),
        faq('q-3', 3),
        faq('q-4', 4),
        faq('q-5', 5),
        faq('q-6', 6),
      ]).breakdown.faq,
      3,
    );
    assert.equal(
      score([faq('q-1', 1), faq('q-1', 2)]).breakdown.faq,
      0.5,
    );
  });

  it('CHAT submitted questions only', () => {
    assert.equal(score([chat('u-1', 1)]).breakdown.chat, 2);
    assert.equal(
      score([
        chat('u-1', 1),
        chat('u-2', 2),
        chat('u-3', 3),
        chat('u-4', 4),
        chat('u-5', 5),
      ]).breakdown.chat,
      10,
    );
    assert.equal(
      score([
        at({ type: 'QuestionOpened', questionId: 'assistant' }, 1),
      ]).breakdown.chat,
      0,
    );
  });

  it('MANDATORY path is one +30 and is not fabricated', () => {
    const completed = [
      ...answers(['quality', 'layout', 'maintenance'], 10),
      land(20),
    ];
    assert.equal(score(completed, { qualifiedLead: true }).breakdown.mandatory, 30);
    assert.equal(score(completed, { qualifiedLead: true }).breakdown.mandatory, 30);
    assert.equal(score(completed, { qualifiedLead: false }).breakdown.mandatory, 0);
    assert.equal(
      score([...answers(['quality', 'layout'], 10), land(20)], {
        qualifiedLead: true,
      }).breakdown.mandatory,
      0,
    );
    assert.equal(
      score(answers(['quality', 'layout', 'maintenance'], 10), {
        qualifiedLead: true,
      }).breakdown.mandatory,
      0,
    );
  });

  it('TOTAL rounding, cap, and determinism', () => {
    const result = score(
      [
        image('exterior/01.webp', 1),
        image('exterior/02.webp', 2),
        image('kitchen/11.webp', 3),
        image('living-room/12.webp', 4),
        ...answers(['quality', 'layout', 'maintenance'], 10),
        land(20),
      ],
      { qualifiedLead: true },
    );
    assert.equal(result.rawScore, 30.4);
    assert.equal(result.displayScore, 30);
    assert.equal(displayIndexPripravenosti(39.4), 39);
    assert.equal(displayIndexPripravenosti(39.5), 40);
    const sameAgain = score(
      [
        image('exterior/01.webp', 1),
        image('exterior/02.webp', 2),
        image('kitchen/11.webp', 3),
        image('living-room/12.webp', 4),
        ...answers(['quality', 'layout', 'maintenance'], 10),
        land(20),
      ],
      { qualifiedLead: true },
    );
    assert.deepEqual(sameAgain, result);
  });

  it('CALIBRATION A minimal / sparse', () => {
    const result = score([], { qualifiedLead: true });
    assert.deepEqual(result.breakdown, {
      mandatory: 0,
      video: 0,
      images: 0,
      rooms: 0,
      tourReturns: 0,
      priorities: 0,
      faq: 0,
      chat: 0,
    });
    assert.equal(result.rawScore, 0);
    assert.equal(result.displayScore, 0);
  });

  it('CALIBRATION B approximately middle of the scale', () => {
    const result = score(
      [
        room('kitchen', 1),
        image('exterior/01.webp', 2),
        image('exterior/02.webp', 3),
        image('kitchen/11.webp', 4),
        image('living-room/12.webp', 5),
        image('bedroom/15.webp', 6),
        priorities(['quality', 'layout', 'maintenance'], [0.8, 0.5, 0.27], 10),
        ...answers(['quality', 'layout', 'maintenance'], 20),
        faq('energy-01', 30),
        land(40),
      ],
      { qualifiedLead: true },
    );
    assert.equal(result.breakdown.mandatory, 30);
    assert.equal(result.breakdown.rooms, 1);
    assert.equal(result.breakdown.images, 0.5);
    assert.equal(result.breakdown.priorities, 9);
    assert.equal(result.breakdown.faq, 0.5);
    assert.equal(result.rawScore, 41);
    assert.equal(result.displayScore, 41);
  });

  it('CALIBRATION C maximally engaged caps at 100', () => {
    const selectable = [
      'plot',
      'layout',
      'privacy',
      'design',
      'energy',
      'operating-costs',
      'quality',
      'maintenance',
    ] as const;
    const events: ReadinessEvent[] = [
      at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 1),
      at(
        {
          type: 'VideoPlaybackMilestone',
          mediaId: 'tour-video',
          milestone: 'half',
        },
        2,
      ),
      at(
        {
          type: 'VideoPlaybackMilestone',
          mediaId: 'tour-video',
          milestone: 'end',
        },
        3,
      ),
      at({ type: 'VideoPlaybackStarted', mediaId: 'tour-video' }, 10_000),
      ...BUNGALOV_IMAGES.map((id, index) => image(id, 20 + index)),
      ...BUNGALOV_IMAGES.map((id, index) => image(id, 200 + index)),
      ...BUNGALOV_ROOMS.map((id, index) => room(id, 400 + index)),
      at({ type: 'JourneyStageEntered', stageId: 'tour' }, 500),
      at({ type: 'JourneyStageEntered', stageId: 'priority' }, 501),
      at({ type: 'JourneyStageEntered', stageId: 'tour' }, 502),
      at({ type: 'JourneyStageEntered', stageId: 'racio' }, 503),
      at({ type: 'JourneyStageEntered', stageId: 'tour' }, 504),
      priorities(
        selectable,
        selectable.map((_, index) => 0.5 + index * 0.01),
        600,
      ),
      priorities(
        selectable,
        selectable.map((_, index) => 0.6 + index * 0.01),
        2000,
      ),
      priorities(
        selectable,
        selectable.map((_, index) => 0.7 + index * 0.01),
        4000,
      ),
      ...answers(selectable.slice(0, 3), 5000),
      land(5100),
      ...Array.from({ length: 21 }, (_, index) => faq(`faq-${index}`, 5200 + index)),
      ...Array.from({ length: 5 }, (_, index) => chat(`chat-${index}`, 5300 + index)),
    ];
    const result = score(events, { qualifiedLead: true });
    assert.equal(result.breakdown.video, 3.5);
    assert.equal(result.breakdown.images, 16 * 0.1 + 2 + 16 * 0.5);
    assert.equal(result.breakdown.rooms, 13);
    assert.equal(result.breakdown.tourReturns, 10);
    assert.equal(result.breakdown.priorities, 8 + 16 + 6);
    assert.equal(result.breakdown.faq, 10.5);
    assert.equal(result.breakdown.chat, 10);
    assert.equal(result.breakdown.mandatory, 30);
    assert.equal(result.rawScore, 3.5 + 11.6 + 13 + 10 + 30 + 10.5 + 10 + 30);
    assert.equal(result.rawScore > 100, true);
    assert.equal(result.displayScore, 100);
  });

  it('CALIBRATION D USER-shaped BUNGALOV facts only', () => {
    const visited = BUNGALOV_ROOMS.filter((id) => id !== 'technical-room');
    const result = score(
      [
        ...visited.map((id, index) => room(id, index + 1)),
        priorities(['quality', 'layout', 'maintenance'], [0.8, 0.5, 0.27], 20),
        ...answers(['quality', 'layout', 'maintenance'], 30),
        ...Array.from({ length: 6 }, (_, index) => faq(`faq-${index}`, 40 + index)),
        land(50),
      ],
      { qualifiedLead: true },
    );
    assert.equal(result.breakdown.rooms, 10);
    assert.equal(result.breakdown.priorities, 9);
    assert.equal(result.breakdown.faq, 3);
    assert.equal(result.breakdown.mandatory, 30);
    assert.equal(result.breakdown.video, 0);
    assert.equal(result.breakdown.images, 0);
    assert.equal(result.breakdown.tourReturns, 0);
    assert.equal(result.breakdown.chat, 0);
    assert.equal(result.rawScore, 52);
    assert.equal(result.displayScore, 52);
  });
});
