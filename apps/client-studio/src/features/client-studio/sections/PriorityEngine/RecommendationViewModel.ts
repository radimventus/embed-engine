export interface RecommendationViewModel {
  title: string;
  score: number;
  strengths: string[];
  considerations: string[];
  nextStep: string;
}

export const MOCK_RECOMMENDATION_VIEW_MODEL: RecommendationViewModel = {
  title: 'Recommendation',
  score: 5,
  strengths: ['Low operating costs', 'Efficient layout', 'Good privacy'],
  considerations: ['Garden orientation', 'Future flexibility'],
  nextStep: 'Continue to your personalized report.',
};

export const RECOMMENDATION_MAX_STRENGTHS = 3;
export const RECOMMENDATION_MAX_CONSIDERATIONS = 2;
