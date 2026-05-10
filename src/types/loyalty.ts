// src/types/loyalty.ts
export interface BackendReward {
  id: string;
  name: string;
  pointsRequired: number;
  description: string;
}

export interface UserPoints {
  points: number;
  stamps: number;
  stampGoal: number;
  canRedeemStamps: boolean;
}

export interface StampCard {
  stamps: number;
  goal: number;
  progress: number;
  nextRewardStamps: number;
}

export interface PointsHistoryItem {
  id: string;
  userId: string;
  points: number;
  type: string;
  description: string;
  createdAt: string;
}

export interface RedeemResult {
  success: boolean;
  reward: BackendReward;
  remainingPoints: number;
}