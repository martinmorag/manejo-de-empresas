import React, { ChangeEvent } from "react";
import ReactAvatarEditor, { Position } from "react-avatar-editor";

export interface UploadProfileState {
    image: File | string;
    allowZoomOut: boolean;
    position: Position;
    scale: number;
    rotate: number;
    borderRadius: number;
    preview: string | null;
    width: number;
    height: number;
}

interface UploadProfileProps {
    onImageSubmit: (image: string) => void; // Add a callback prop
}

class UploadProfile extends React.Component<UploadProfileProps, UploadProfileState> {
  private editor: ReactAvatarEditor | null = null;

  constructor(props: UploadProfileProps) {
    super(props);
    this.state = {
      image: "",
      allowZoomOut: false,
      position: { x: 0.5, y: 0.5 },
      scale: 1,
      rotate: 0,
      borderRadius: 50,
      preview: null,
      width: 330,
      height: 330,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
  }

  handleNewImage = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      this.setState({ image: e.target.files[0] });
    }
  };

  handleScale = (e: ChangeEvent<HTMLInputElement>) => {
    const scale = parseFloat(e.target.value);
    this.setState({ scale });
  };

  handlePositionChange = (position: Position) => {
    this.setState({ position });
  };

  setEditorRef = (editor: ReactAvatarEditor) => {
    this.editor = editor;
  };

  handleSubmit = (e: React.MouseEvent<HTMLButtonElement, MouseEvent>) => {
    e.preventDefault();
    if (this.editor) {
      this.editor.getImageScaledToCanvas().toBlob((blob) => {
        if (blob) {
          const reader = new FileReader();
          reader.onloadend = () => {
            const dataUrl = reader.result as string; // Base64 string representation of the image
            this.props.onImageSubmit(dataUrl); // Call the prop callback with the image data
          };
          reader.readAsDataURL(blob);
        }
      });
    }
  };

  render() {
    return (
      <div>
        {this.state.image && (
        <div>
            <ReactAvatarEditor
              ref={this.setEditorRef}
              scale={this.state.scale}
              width={this.state.width}
              height={this.state.height}
              position={this.state.position}
              onPositionChange={this.handlePositionChange}
              rotate={this.state.rotate}
              borderRadius={this.state.width / (100 / this.state.borderRadius)}
              image={this.state.image}
              color={[255, 255, 255, 0.6]} // RGBA
              className="editor-canvas"
            />
            <h3 className="mt-5 text-lg font-semibold text-gray-700">Zoom</h3>
            <input
              name="scale"
              type="range"
              onChange={this.handleScale}
              min={this.state.allowZoomOut ? "0.1" : "1"}
              max="2"
              step="0.01"
              defaultValue="1"
              className="w-full h-2 mb-7 bg-gray-300 rounded-lg appearance-none cursor-pointer accent-blue-500 hover:accent-blue-600"
            />
        </div>
        )}
        <input
        id="upload-img-input"
        name="upload-img-input"
        type="file"
        onChange={this.handleNewImage}
        className="hidden"
        /><label htmlFor="upload-img-input" className="bg-secondary text-white px-4 py-2 rounded-md cursor-pointer">
            {this.state.image ? "Elegir otra Imagen" : "Elegir Imagen" }
            </label>
        <br />
        {this.state.image && 
            <div>
            <button onClick={this.handleSubmit} 
            className="mt-5 border border-solid border-main py-1 px-3 rounded-md text-lg">Elegir</button>
            </div>
        }
      </div>
    );
  }
}

export default UploadProfile;