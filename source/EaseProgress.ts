export interface EaseProgressProps {
  transitionFunction?: (x: number) => number;
}

export class EaseProgress {
  minValue: number;
  maxValue: number;
  userRange: number;
  progressSpeed: number;
  transitionFunction?: (x: number) => number;
  currentProgress: number;
  minCurrentProgress: number;
  maxCurrentProgress: number;
  isReversed: boolean;

  constructor(props: EaseProgressProps) {
    this.transitionFunction = props.transitionFunction;

    this.minValue = 0;
    this.maxValue = 0;
    this.isReversed = false;
    this.userRange = 0;
    this.minCurrentProgress = 0;
    this.maxCurrentProgress = 0;
    this.currentProgress = 0;
    this.progressSpeed = 0;
  }

  start(params: {
    minValue: number;
    maxValue: number;
    durationSeconds: number;
  }) {
    this.progressSpeed = 1 / params.durationSeconds;
    this.minValue = params.minValue;
    this.maxValue = params.maxValue;
    this.isReversed = this.minValue > this.maxValue;
    this.userRange = this.maxValue - this.minValue;
    this.minCurrentProgress = Number(this.isReversed);
    this.maxCurrentProgress = Number(!this.isReversed);
    this.currentProgress = this.minCurrentProgress;
  }

  updateProgress(delta: number) {
    if (this.currentProgress === this.maxCurrentProgress) {
      return;
    }
    const progressDelta = delta * this.progressSpeed;
    if (this.isReversed) {
      this.currentProgress -= progressDelta;
      this.currentProgress = Math.max(this.currentProgress, this.maxCurrentProgress);
    } else {
      this.currentProgress += progressDelta;
      this.currentProgress = Math.min(this.currentProgress, this.maxCurrentProgress);
    }
  }

  getCurrentProgress() {
    const currentProgress = (!!this.transitionFunction) ?
      this.transitionFunction(this.currentProgress) :
      this.currentProgress;
    return this.convertToUserRange(currentProgress);
  }

  checkIsProgressCompelete() {
    return this.currentProgress === this.maxCurrentProgress;
  }

  convertToUserRange(value: number) {
    const progressRange = this.maxCurrentProgress - this.minCurrentProgress;
    return (((value - this.minCurrentProgress) * this.userRange) / progressRange) + this.minValue;
  }
}

export const easeOutQuint = (x: number) => {
  return 1 - Math.pow(1 - x, 5);
};

