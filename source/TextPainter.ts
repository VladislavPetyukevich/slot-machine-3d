export class TextPainter {
  canvas: HTMLCanvasElement;
  canvasContext: CanvasRenderingContext2D;

  constructor(props: { width: number, height: number }) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = props.width;
    this.canvas.height = props.height;
    const context = this.canvas.getContext('2d');
    if (!context) {
      throw new Error('Canvas context are not found.');
    }
    context.textAlign = 'center';
    this.canvasContext = context;
  }

  drawText(text: string, onLoad: (dataUrl: string) => void) {
    this.canvasContext.clearRect(
      0,
      0,
      this.canvas.width,
      this.canvas.height,
    );
    this.canvasContext.font = '48px Ribeye Marrow';
    this.canvasContext.fillText(text, ~~(this.canvas.width / 2), ~~(this.canvas.height / 2));
    const dataUrl = this.canvas.toDataURL();
    onLoad(dataUrl);
  }
}

