import {
  DecoratorNode,
  DOMConversionMap,
  DOMConversionOutput,
  DOMExportOutput,
  LexicalNode,
  NodeKey,
  SerializedLexicalNode,
  Spread,
} from 'lexical';
import React from 'react';

export interface ImagePayload {
  src: string;
  altText?: string;
  width?: number;
  height?: number;
  caption?: string;
  key?: NodeKey;
}

export type SerializedImageNode = Spread<
  {
    src: string;
    altText?: string;
    width?: number;
    height?: number;
    caption?: string;
  },
  SerializedLexicalNode
>;

function convertImageElement(domNode: Node): null | DOMConversionOutput {
  if (domNode instanceof HTMLImageElement) {
    const { src, alt, width, height } = domNode;
    const node = $createImageNode({ src, altText: alt, width, height });
    return { node };
  }
  return null;
}

export class ImageNode extends DecoratorNode<React.JSX.Element> {
  __src: string;
  __altText?: string;
  __width?: number;
  __height?: number;
  __caption?: string;

  static getType(): string {
    return 'image';
  }

  static clone(node: ImageNode): ImageNode {
    return new ImageNode(
      node.__src,
      node.__altText,
      node.__width,
      node.__height,
      node.__caption,
      node.__key
    );
  }

  static importJSON(serializedNode: SerializedImageNode): ImageNode {
    const { src, altText, width, height, caption } = serializedNode;
    return $createImageNode({ src, altText, width, height, caption });
  }

  static importDOM(): DOMConversionMap | null {
    return {
      img: () => ({
        conversion: convertImageElement,
        priority: 0,
      }),
    };
  }

  constructor(
    src: string,
    altText?: string,
    width?: number,
    height?: number,
    caption?: string,
    key?: NodeKey
  ) {
    super(key);
    this.__src = src;
    this.__altText = altText;
    this.__width = width;
    this.__height = height;
    this.__caption = caption;
  }

  exportDOM(): DOMExportOutput {
    const element = document.createElement('img');
    element.setAttribute('src', this.__src);
    if (this.__altText) {
      element.setAttribute('alt', this.__altText);
    }
    if (this.__width) {
      element.setAttribute('width', this.__width.toString());
    }
    if (this.__height) {
      element.setAttribute('height', this.__height.toString());
    }
    element.setAttribute('class', 'blog-editor-image');
    return { element };
  }

  exportJSON(): SerializedImageNode {
    return {
      src: this.__src,
      altText: this.__altText,
      width: this.__width,
      height: this.__height,
      caption: this.__caption,
      type: 'image',
      version: 1,
    };
  }

  getSrc(): string {
    return this.__src;
  }

  getAltText(): string | undefined {
    return this.__altText;
  }

  setWidthAndHeight(width: number, height: number): void {
    const writable = this.getWritable();
    writable.__width = width;
    writable.__height = height;
  }

  createDOM(): HTMLElement {
    const div = document.createElement('div');
    div.className = 'blog-editor-image-wrapper';
    return div;
  }

  updateDOM(): false {
    return false;
  }

  decorate(): React.JSX.Element {
    return (
      <ImageComponent
        src={this.__src}
        altText={this.__altText}
        width={this.__width}
        height={this.__height}
        caption={this.__caption}
        nodeKey={this.__key}
      />
    );
  }
}

interface ImageComponentProps {
  src: string;
  altText?: string;
  width?: number;
  height?: number;
  caption?: string;
  nodeKey: NodeKey;
}

function ImageComponent({
  src,
  altText,
  width,
  height,
  caption,
}: ImageComponentProps): React.JSX.Element {
  return (
    <figure className="blog-editor-image-wrapper">
      <img
        src={src}
        alt={altText || ''}
        style={{
          width: width ? `${width}px` : undefined,
          height: height ? `${height}px` : undefined,
        }}
        draggable="false"
      />
      {caption && <figcaption className="blog-editor-image-caption">{caption}</figcaption>}
    </figure>
  );
}

export function $createImageNode(payload: ImagePayload): ImageNode {
  return new ImageNode(
    payload.src,
    payload.altText,
    payload.width,
    payload.height,
    payload.caption,
    payload.key
  );
}

export function $isImageNode(node: LexicalNode | null | undefined): node is ImageNode {
  return node instanceof ImageNode;
}
