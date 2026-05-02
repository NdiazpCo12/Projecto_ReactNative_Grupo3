export type RootStackParamList = {
  Login: undefined;
  Student: undefined;
};

export type StudentTabsParamList = {
  Home: undefined;
  AssessmentsStack: undefined;
  Results: undefined;
  Profile: undefined;
};

export type AssessmentStackParamList = {
  Assessments: undefined;
  AssessmentDetail: { assessmentId: string; groupId: string };
};
