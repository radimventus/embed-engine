export type ExperienceEventType =
  | 'experience.opened'
  | 'hero.video.opened'
  | 'hero.video.completed'
  | 'house.saved'
  | 'tour.started'
  | 'tour.completed'
  | 'floorplan.opened'
  | 'room.viewed'
  | 'room.changed'
  | 'floor.changed'
  | 'floorplan.zoomed'
  | 'priority.selected'
  | 'priority.changed'
  | 'priority.completed'
  | 'specification.viewed'
  | 'energy.viewed'
  | 'construction.viewed'
  | 'financing.viewed'
  | 'ai.conversation.started'
  | 'ai.conversation.completed'
  | 'contact.opened'
  | 'contact.submitted';

export type ExperienceEventPayload = Readonly<
  Record<string, string | number | boolean | null>
>;
