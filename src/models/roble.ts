export type JsonRecord = Record<string, unknown>;

export type RobleCourseHome = {
  id: string;
  name: string;
  code: string;
  teacherEmail: string;
  createdAt: Date;
  status: string;
  studentCount: number;
  pendingEvaluations: number;
};

export type RobleStudentRecord = {
  id: string;
  username: string;
  orgDefinedId: string;
  firstName: string;
  lastName: string;
  email: string;
};

export type RobleGroupMemberRecord = {
  id: string;
  groupId: string;
  studentId: string;
  enrollmentDate: string;
};

export type RobleCourseGroupRecord = {
  id: string;
  courseId: string;
  categoryId: string;
  groupName: string;
  groupCode: string;
};

export type RobleGroupCategoryRecord = {
  id: string;
  courseId: string;
  name: string;
};

export type RobleAssessment = {
  id?: string;
  courseId: string;
  categoryId: string;
  name: string;
  visibility: string;
  status: string;
  startsAt: Date;
  endsAt: Date;
  createdByEmail: string;
  createdAt: Date;
};

export type RobleAssessmentCriterion = {
  id?: string;
  assessmentId: string;
  name: string;
  description: string;
  weight: number;
  displayOrder: number;
  createdAt: Date;
};

export type RobleAssessmentCriterionLevel = {
  id?: string;
  criterionId: string;
  scoreValue: number;
  label: string;
  descriptionEn: string;
  descriptionEs: string;
  displayOrder: number;
};

export type RobleAssessmentCriterionDetail = {
  criterion: RobleAssessmentCriterion;
  levels: RobleAssessmentCriterionLevel[];
};

export type RobleAssessmentSubmission = {
  id?: string;
  assessmentId: string;
  courseId: string;
  categoryId: string;
  groupId: string;
  reviewerStudentId: string;
  status: string;
  generalComment: string;
  startedAt?: Date;
  submittedAt?: Date;
  createdAt: Date;
};

export type RobleAssessmentPeerReview = {
  id?: string;
  submissionId: string;
  assessmentId: string;
  courseId: string;
  categoryId: string;
  groupId: string;
  reviewerStudentId: string;
  revieweeStudentId: string;
  generalComment: string;
  createdAt: Date;
};

export type RobleAssessmentScore = {
  id?: string;
  peerReviewId: string;
  assessmentId: string;
  courseId: string;
  categoryId: string;
  groupId: string;
  reviewerStudentId: string;
  revieweeStudentId: string;
  criterionId: string;
  scoreValue: number;
  createdAt: Date;
  updatedAt: Date;
};

export type StudentCourseEnrollment = {
  course: RobleCourseHome;
  groupName: string;
  groupCode: string;
  groupCategoryName: string;
  enrollmentDate: string;
};

export type StudentAssessmentTeammate = {
  studentId: string;
  name: string;
  email: string;
};

export type StudentAssessmentAssignment = {
  assessment: RobleAssessment;
  course: RobleCourseHome;
  category?: RobleGroupCategoryRecord;
  group: RobleCourseGroupRecord;
  reviewer: RobleStudentRecord;
  teammates: StudentAssessmentTeammate[];
  criteria: RobleAssessmentCriterionDetail[];
  isSubmitted: boolean;
  submissionId?: string;
  submissionStatus?: string;
  submittedAt?: Date;
  savedScoresByReviewee: Record<string, Record<string, number>>;
  statusLabel: string;
  categoryName: string;
  canSubmit: boolean;
};

export type StudentResultCriterionScore = {
  label: string;
  score: number;
  responseCount: number;
  displayOrder: number;
};

export type StudentAssessmentHistoryItem = {
  assessmentId: string;
  title: string;
  date: Date;
  score: number;
  reviewCount: number;
  criteria: StudentResultCriterionScore[];
};

export type StudentCourseResults = {
  courseId: string;
  courseName: string;
  courseCode: string;
  overallScore: number;
  assessmentCount: number;
  reviewCount: number;
  criteria: StudentResultCriterionScore[];
  history: StudentAssessmentHistoryItem[];
  displayLabel: string;
  hasResults: boolean;
};

export type StudentResultsSummary = {
  overallScore: number;
  assessmentCount: number;
  reviewCount: number;
  criteria: StudentResultCriterionScore[];
  history: StudentAssessmentHistoryItem[];
  courseResults: StudentCourseResults[];
  hasResults: boolean;
};

export const emptyStudentResultsSummary: StudentResultsSummary = {
  overallScore: 0,
  assessmentCount: 0,
  reviewCount: 0,
  criteria: [],
  history: [],
  courseResults: [],
  hasResults: false,
};
