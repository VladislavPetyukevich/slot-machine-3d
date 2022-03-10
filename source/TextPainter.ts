export interface TextPainterProps {
  width: number;
  height: number;
  size: string;
  font: string;
  fillStyle?: string;
}

export class TextPainter {
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;
  size: string;
  font: string;
  fillStyle?: string;

  constructor(props: TextPainterProps) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = props.width;
    this.canvas.height = props.height;
    this.size = props.size;
    this.font = props.font;
    this.fillStyle = props.fillStyle;
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context are not found.');
    }
    context.textAlign = 'center';
    context.textBaseline = 'middle';
    this.canvasContext = context;
  }

  drawText(
    text: string,
    onLoad: (dataUrl: string) => void
  ) {
    this.canvasContext.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
    if (this.fillStyle) {
      this.canvasContext.fillStyle = this.fillStyle;
    }
    this.canvasContext.font = `${this.size} ${this.font}`;
    this.canvasContext.fillText(text, ~~(this.canvas.width / 2), ~~(this.canvas.height / 2));
    const dataUrl = this.canvas.toDataURL();
    onLoad(dataUrl);
  }
}

