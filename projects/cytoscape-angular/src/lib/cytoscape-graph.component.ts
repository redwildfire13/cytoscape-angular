import {
  AfterViewInit,
  Component,
  ElementRef,
  Input,
  OnChanges,
  SimpleChanges,
  ViewChild,
} from '@angular/core';
import * as cy from 'cytoscape';
import {
  CytoscapeOptions,
  EdgeDefinition,
  LayoutOptions,
  NodeDefinition,
  Position,
  SelectionType,
  Stylesheet,
} from 'cytoscape';

declare var cytoscape: any;

/**
 * The API is a little odd to provide flexibility.
 * EITHER bind to cyOptions (type CytoscapeOptions), to control the options yourself
 * OR this component will build a CytoscapeOptions internally by using all the other inputs.
 * If cyOptions is supplied, all other inputs are ignored.
 * The cyOptions container (HTML element) is always ignored and set internally.
 */
@Component({
  selector: 'cytoscape-graph',
  template: `
    <p-progressSpinner
      *ngIf="loading"
      class="spinner"
      strokeWidth="4"
      fill="#EEEEEE"
      animationDuration=".5s"
    ></p-progressSpinner>
    <div #cyGraph class="graphWrapper"></div>
  `,
  styles: [
    `
      .spinner {
        position: absolute;
        left: '350px';
        z-index: 10;
        width: '250px';
        height: '250px';
      }
      @keyframes ui-progress-spinner-color {
        100%,
        0% {
          stroke: #d62d20;
        }
        40% {
          stroke: #0057e7;
        }
        66% {
          stroke: #008744;
        }
        80%,
        90% {
          stroke: #ffa700;
        }
      }
      .graphWrapper {
        height: 100%;
        width: 100%;
      }
    `,
  ],
})
export class CytoscapeGraphComponent implements OnChanges {
  @ViewChild('cyGraph')
  cyGraph: ElementRef | undefined;

  @Input()
  debug = false;

  @Input()
  nodes: NodeDefinition[] | undefined;
  @Input()
  edges: EdgeDefinition[] | undefined;

  @Input()
  autolock: boolean | undefined;
  @Input()
  autoungrabify: boolean | undefined;
  @Input()
  autounselectify: boolean | undefined;
  @Input()
  boxSelectionEnabled: boolean | undefined;
  @Input()
  desktopTapThreshold: number | undefined;
  @Input()
  hideEdgesOnViewport: boolean | undefined;
  @Input()
  hideLabelsOnViewport: boolean | undefined;
  @Input()
  layoutOptions: LayoutOptions | undefined;
  @Input()
  maxZoom: number | undefined;
  @Input()
  minZoom: number | undefined;
  @Input()
  motionBlur: boolean | undefined;
  @Input()
  motionBlurOpacity: number | undefined;
  @Input()
  pan: Position | undefined;
  @Input()
  panningEnabled: boolean | undefined;
  @Input()
  pixelRatio: number | 'auto' | undefined;
  @Input()
  selectionType: SelectionType | undefined;
  @Input()
  style: Stylesheet[] | undefined;
  @Input()
  styleEnabled: boolean | undefined;
  @Input()
  textureOnViewport: boolean | undefined;
  @Input()
  touchTapThreshold: number | undefined;
  @Input()
  userPanningEnabled: boolean | undefined;
  @Input()
  userZoomingEnabled: boolean | undefined;
  @Input()
  wheelSensitivity: number | undefined;
  @Input()
  zoom: 1 | undefined;
  @Input()
  zoomingEnabled: boolean | undefined;
  @Input()
  showToolbar = true;

  cyOptions: CytoscapeOptions | undefined;
  private cy!: cy.Core;
  loading: boolean = false;

  constructor() {}

  public ngOnChanges(changes: SimpleChanges): any {
    console.log(
      'cytoscape graph component ngOnChanges. changes:',
      JSON.stringify(changes)
    );
    if (changes['style']) {
      console.log('changes["style"]:', JSON.stringify(changes['style']));
      this.runWhileLoading(this.updateStyles.bind(this));
    }
  }

  public centerElements(selector) {
    if (!this.cy) {
      return;
    }
    const elems = this.cy.$(selector);
    this.cy.center(elems);
  }

  public zoomToElement(selector: string, level = 3) {
    let position = this.cy?.$(selector)?.position();
    if (!position) {
      console.warn(`Cannot zoom to ${selector}`);
    }
    this.cy.zoom({
      level: level,
      position: position,
    });
  }

  public render() {
    this.runWhileLoading(this.rerender.bind(this));
  }

  public runWhileLoading(f: Function) {
    this.loading = true;
    setTimeout(() => {
      f();
      setTimeout(() => {
        this.loading = false;
      }, 30);
    }, 0);
  }

  private updateStyles() {
    if (this.cy && this.style) {
      this.cy.style(this.style);
    }
  }

  public rerender() {
    //TODO : this takes a heavy-handed approach, refine for performance
    if (!this.cyGraph) {
      console.warn(`No cyGraph found`);
      return;
    }

    const cyOptions = this.cyOptions || {
      // ignored, use nodes and edges
      // elements: this.elements,
      autolock: this.autolock,
      autoungrabify: this.autoungrabify,
      autounselectify: this.autounselectify,
      boxSelectionEnabled: this.boxSelectionEnabled,
      container: this.cyGraph.nativeElement,
      desktopTapThreshold: this.desktopTapThreshold,
      hideEdgesOnViewport: this.hideEdgesOnViewport,
      hideLabelsOnViewport: this.hideLabelsOnViewport,
      layout: this.layoutOptions,
      maxZoom: this.maxZoom,
      minZoom: this.minZoom,
      motionBlur: this.motionBlur,
      motionBlurOpacity: this.motionBlurOpacity,
      pan: this.pan,
      panningEnabled: this.panningEnabled,
      pixelRatio: this.pixelRatio,
      selectionType: this.selectionType,
      style: this.style,
      styleEnabled: this.styleEnabled,
      textureOnViewport: this.textureOnViewport,
      touchTapThreshold: this.touchTapThreshold,
      userPanningEnabled: this.userPanningEnabled,
      userZoomingEnabled: this.userZoomingEnabled,
      wheelSensitivity: this.wheelSensitivity,
      zoomingEnabled: this.zoomingEnabled,
      zoom: this.zoom,
    };
    // TODO do reset() instead?
    this.cy = cytoscape(cyOptions);
    this.cy.startBatch();
    this.cy.boxSelectionEnabled(this.boxSelectionEnabled);
    this.cy.nodes().remove();
    this.cy.edges().remove();
    if (this.nodes) {
      this.cy.add(this.nodes);
    }
    if (this.edges) {
      this.cy.add(this.edges);
    }
    this.cy.endBatch();
    if (this.layoutOptions) {
      this.cy.layout(this.layoutOptions).run();
    }
  }
}

/*
Gradient:

background-gradient-stop-colors : The colours of the background gradient stops (e.g. cyan magenta yellow).
background-gradient-stop-positions : The positions of the background gradient stops (e.g. 0% 50% 100%). If not specified or invalid, the stops will divide equally.
background-gradient-direction : For background-fill: linear-gradient, this property defines the direction of the background gradient. The following values are accepted:
to-bottom (default)
to-top
to-left
to-right
to-bottom-right
to-bottom-left
to-top-right
to-top-left
 */
