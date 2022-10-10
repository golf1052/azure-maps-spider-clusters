import * as azmaps from 'azure-maps-control';
import { SpiderClusterOptions } from './SpiderClusterOptions';
import { SpiderClusterManagerEvents } from './SpiderClusterManagerEvents';
import { SpiderClusterLayers } from './SpiderClusterLayers';

/**
* Adds a visualization to the map which expands clusters into a spiral spider layout.
*/
export class SpiderClusterManager extends azmaps.internal.EventEmitter<SpiderClusterManagerEvents> {

    /**********************
    * Private Properties
    ***********************/

    private _map: azmaps.Map;
    private _datasource: azmaps.source.DataSource;
    private _spiderDataSource: azmaps.source.DataSource;
    private _clusterLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer;
    private _unclustedLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer;
    private _spiderFeatureLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer;
    private _spiderLineLayer: azmaps.layer.LineLayer;
    private _hoverStateId: string = null;
    private _spiderDatasourceId: string;
    private _currentCluster: azmaps.data.Feature<azmaps.data.Point, any>;

    private _options: SpiderClusterOptions = {
        circleSpiralSwitchover: 6,
        minCircleLength: 30,
        minSpiralAngleSeperation: 25,
        spiralDistanceFactor: 5,
        maxFeaturesInWeb: 100,
        closeWebOnPointClick: true,
        stickLayerOptions: {
            strokeColor: [
                'case',
                ['boolean', ['feature-state', 'hover'], false],
                'red',
                'black'
            ]
        }
    };

    /**********************
    * Constructor
    ***********************/

    /**
    * @constructor
    * A cluster manager that expands clusters when selectd into a spiral layout.
    * @param map A map instance to add the cluster layer to.
    * @param clusterLayer The layer used for rendering the clusters.
    * @param unclustedLayer The rendering layer used for displaying unclustered data (individual features).
    * @param options A combination of SpiderClusterManager and Cluster options.
    */
    constructor(map: azmaps.Map, clusterLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer,
        unclustedLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer, options?: SpiderClusterOptions) {
        super();

        const self = this;
        const azlayer = azmaps.layer;

        self._map = map;
        self._clusterLayer = clusterLayer;

        let s = clusterLayer.getSource();
        if (typeof s === 'string') {
            s = map.sources.getById(s);
        }

        if (s instanceof azmaps.source.DataSource) {
            self._datasource = s;
        } else {
            throw 'Data source on cluster layer is not supported.';
        }

        options = options || {};

        //Create a data source to manage the spider lines. 
        const spiderDataSource = new azmaps.source.DataSource();
        self._spiderDataSource = spiderDataSource;
        map.sources.add(spiderDataSource);

        self._spiderDatasourceId = spiderDataSource.getId();

        self._spiderLineLayer = new azlayer.LineLayer(spiderDataSource, null, self._options.stickLayerOptions);
        map.layers.add(self._spiderLineLayer);

        //Make a copy of the cluster layer options.
        var unclustedLayerOptions = Object.assign({}, unclustedLayer.getOptions());
        unclustedLayerOptions.source = undefined;
        unclustedLayerOptions.filter = ['any', ['==', ['geometry-type'], 'Point'], ['==', ['geometry-type'], 'MultiPoint']] //Only render Point or MultiPoints in this layer.;        

        self._unclustedLayer = unclustedLayer;

        let spiderFeatureLayer: azmaps.layer.BubbleLayer | azmaps.layer.SymbolLayer;

        if (unclustedLayer instanceof azlayer.BubbleLayer) {
            spiderFeatureLayer = new azlayer.BubbleLayer(spiderDataSource, null, unclustedLayerOptions);
        } else {
            unclustedLayerOptions.iconOptions = unclustedLayerOptions.iconOptions || {};

            Object.assign(unclustedLayerOptions.iconOptions, {
                allowOverlap: true,
                ignorePlacement: true
            });

            spiderFeatureLayer = new azlayer.SymbolLayer(spiderDataSource, null, unclustedLayerOptions);
        }

        self._spiderFeatureLayer = spiderFeatureLayer;
        map.layers.add(spiderFeatureLayer);

        self.setOptions(options);

        const mapEvents = map.events;
        const layerClickEvent = self._layerClickEvent;
        const hideSpiderCluster = self.hideSpiderCluster;

        mapEvents.add('click', hideSpiderCluster);
        mapEvents.add('movestart', hideSpiderCluster);
        mapEvents.add('mouseleave', spiderFeatureLayer, self._unhighlightStick);
        mapEvents.add('mousemove', spiderFeatureLayer, self._highlightStick);
        mapEvents.add('click', clusterLayer, layerClickEvent);
        mapEvents.add('click', spiderFeatureLayer, layerClickEvent);
        mapEvents.add('click', unclustedLayer, layerClickEvent);
    }

    /**********************
    * Public Functions
    ***********************/

    /**
    * Disposes the SpiderClusterManager and releases it's resources.
    */
    public dispose(): void {
        const self = this;
        const map = self._map;
        const mapEvents = map.events;
        const spiderFeatureLayer = self._spiderFeatureLayer;
        const layerClickEvent = self._layerClickEvent;
        const hideSpiderCluster = self.hideSpiderCluster;

        //Remove events.
        mapEvents.remove('click', hideSpiderCluster);
        mapEvents.remove('movestart', hideSpiderCluster);
        mapEvents.remove('click', self._clusterLayer, layerClickEvent);
        mapEvents.remove('mouseleave', spiderFeatureLayer, self._unhighlightStick);
        mapEvents.remove('mousemove', spiderFeatureLayer, self._highlightStick);
        mapEvents.remove('click', spiderFeatureLayer, layerClickEvent);
        mapEvents.remove('click', self._unclustedLayer, layerClickEvent);

        //Remove layers.
        map.layers.remove(spiderFeatureLayer);
        self._spiderFeatureLayer = null;

        map.layers.remove(self._spiderLineLayer);
        self._spiderLineLayer = null;

        //Clear and dispose of datasource.
        self._spiderDataSource.clear();
        map.sources.remove(self._spiderDataSource);
        self._spiderDataSource = null;
    }

    /**
     * Gets the options of the SpiderClusterManager.
     */
    public getOptions(): SpiderClusterOptions {
        return JSON.parse(JSON.stringify(this._options));
    }

    /**
     * Gets all layers managed by the spider cluster manager.
     */
    public getLayers(): SpiderClusterLayers {
        const self = this;

        return {
            clusterLayer: self._clusterLayer,
            unclustedLayer: self._unclustedLayer,
            spiderFeatureLayer: self._spiderFeatureLayer,
            spiderLineLayer: self._spiderLineLayer
        };
    }

    /**
    * Collapses any open/expanded spider clusters.
    */
    public hideSpiderCluster = (e?: azmaps.MapMouseEvent): void => {
        const self = this;
        //If closeWebOnPointClick is false, only hide the spider web if the first feature is not in the web layer.
        //If closeWebOnPointClick is true, hide the spider web.

        if (!e || self._options.closeWebOnPointClick ||
            //@ts-ignore      
            (!self._options.closeWebOnPointClick && e.shapes && e.shapes.length > 0 && (e.shapes[0] instanceof azmaps.Shape && e.shapes[0].dataSource && e.shapes[0].dataSource.id !== self._spiderDataSource.getId()))) {
            self._spiderDataSource.clear();
        }
    }

    /**
    * Sets the options used to customize how the SpiderClusterManager renders clusters.
    * @param options The options used to customize how the SpiderClusterManager renders clusters.
    */
    public setOptions(options: SpiderClusterOptions): void {
        const self = this;
        const opt = self._options;

        self.hideSpiderCluster();

        if (options) {
            if (typeof options.circleSpiralSwitchover === 'number') {
                opt.circleSpiralSwitchover = options.circleSpiralSwitchover;
            }

            if (typeof options.maxFeaturesInWeb === 'number') {
                opt.maxFeaturesInWeb = options.maxFeaturesInWeb;
            }

            if (typeof options.minSpiralAngleSeperation === 'number') {
                opt.minSpiralAngleSeperation = options.minSpiralAngleSeperation;
            }

            if (typeof options.spiralDistanceFactor === 'number') {
                opt.spiralDistanceFactor = options.spiralDistanceFactor;
            }

            if (typeof options.minCircleLength === 'number') {
                opt.minCircleLength = options.minCircleLength;
            }

            if (typeof options.closeWebOnPointClick === 'boolean') {
                opt.closeWebOnPointClick = options.closeWebOnPointClick;
            }

            if (options.stickLayerOptions) {
                opt.stickLayerOptions = options.stickLayerOptions;
                self._spiderLineLayer.setOptions(options.stickLayerOptions);
            }

            if (typeof options.visible === 'boolean' && opt.visible !== options.visible) {
                opt.visible = options.visible;
                self._spiderLineLayer.setOptions({ visible: options.visible });
                (<azmaps.layer.SymbolLayer>self._spiderFeatureLayer).setOptions({ visible: options.visible });
            }
        }
    }

    /**
    * Expands a cluster into it's open spider layout.
    * @param cluster The cluster to show in it's open spider layout.
    */
    public showSpiderCluster(cluster: azmaps.data.Feature<azmaps.data.Point, azmaps.ClusteredProperties>): void {
        const self = this;
        const opt = self._options;

        const oldData = self._spiderDataSource.getShapes();

        if (cluster && (<azmaps.ClusteredProperties>cluster.properties).cluster) {
            const clusterId = (<azmaps.ClusteredProperties>cluster.properties).cluster_id;

            if (oldData.length > 0 && oldData[0].getProperties().cluster_id === clusterId) {
                //No need to reload the spider web. 
                return;
            }

            self.hideSpiderCluster();

            self._datasource.getClusterLeaves(clusterId, opt.maxFeaturesInWeb, 0).then((children) => {
                //Create spider data.
                const center = cluster.geometry.coordinates;
                const centerPoint = self._map.positionsToPixels([center])[0];
                let angle: number = 0;

                const makeSpiral: boolean = children.length > opt.circleSpiralSwitchover;

                let legPixelLength: number;
                let stepAngle: number;
                let stepLength: number;

                if (makeSpiral) {
                    legPixelLength = opt.minCircleLength / Math.PI;
                    stepLength = 2 * Math.PI * opt.spiralDistanceFactor;
                } else {
                    stepAngle = 2 * Math.PI / children.length;

                    legPixelLength = (opt.spiralDistanceFactor / stepAngle / Math.PI / 2) * children.length;

                    if (legPixelLength < opt.minCircleLength) {
                        legPixelLength = opt.minCircleLength;
                    }
                }

                const shapes = [];

                for (let i = 0, len = children.length; i < len; i++) {
                    //Calculate spider point feature location.
                    if (makeSpiral) {
                        angle += opt.minSpiralAngleSeperation / legPixelLength + i * 0.0005;
                        legPixelLength += stepLength / angle;
                    } else {
                        angle = stepAngle * i;
                    }

                    const pos = self._map.pixelsToPositions([[
                        centerPoint[0] + legPixelLength * Math.cos(angle),
                        centerPoint[1] + legPixelLength * Math.sin(angle)]])[0];

                    //Create stick to point feature.
                    shapes.push(new azmaps.data.Feature(new azmaps.data.LineString([center, pos]), null, i + ''));

                    //Create point feature in spiral that contains same metadata as parent point feature.
                    const c = children[i];
                    const id = (c instanceof azmaps.Shape) ? c.getId() : c.id;

                    //Make a copy of the properties.
                    const p = Object.assign({}, (c instanceof azmaps.Shape) ? c.getProperties() : c.properties);
                    p._stickId = i + '';
                    p._parentId = id;
                    p._cluster = clusterId;

                    shapes.push(new azmaps.data.Feature(new azmaps.data.Point(pos), p));
                }

                this._spiderDataSource.add(shapes);
            });
        }
    }

    /**********************
    * Private Functions
    ***********************/

    /**
    * Click event handler for when a shape in the cluster layer is clicked. 
    * @param e The mouse event argurment from the click event.
    */
    private _layerClickEvent = (e: azmaps.MapMouseEvent): void => {
        const self = this;

        if (e && e.shapes && e.shapes.length > 0) {

            let prop;
            let pos: azmaps.data.Position;
            let s: azmaps.Shape;
            let cluster: azmaps.data.Feature<azmaps.data.Point, any>;

            if (e.shapes[0] instanceof azmaps.Shape) {
                s = <azmaps.Shape>e.shapes[0];
                prop = s.getProperties();
                pos = <azmaps.data.Position>s.getCoordinates();
            } else {
                cluster = <azmaps.data.Feature<azmaps.data.Point, any>>e.shapes[0];
                prop = cluster.properties;
                pos = cluster.geometry.coordinates;
            }

            if (cluster && prop.cluster) {
                self._invokeEvent('featureUnselected', null);

                self._currentCluster = <azmaps.data.Feature<azmaps.data.Point, any>>e.shapes[0];

                self._datasource.getClusterExpansionZoom(prop.cluster_id).then(zoom => {
                    if (zoom <= self._map.getCamera().maxZoom) {
                        self._map.setCamera({
                            center: pos,
                            zoom: zoom,
                            type: 'ease',
                            duration: 200
                        });
                    } else {
                        self.showSpiderCluster(cluster);
                    }
                });
            } else {
                if (typeof prop._parentId !== 'undefined') {
                    s = self._datasource.getShapeById(prop._parentId);
                } else {
                    self._currentCluster = null;
                }

                if (s) {
                    self._invokeEvent('featureSelected', {
                        cluster: self._currentCluster,
                        shape: s
                    });
                }

                if(self._options.closeWebOnPointClick){
                    self.hideSpiderCluster();
                }
            }

            e.preventDefault();
        }
    }

    /**
     * Event handler for when the user is hovering over a feature and the stick joining it to a cluster should be highlighted.
     * @param e mouse event.
     */
    private _highlightStick = (e: azmaps.MapMouseEvent): void => {
        const self = this;

        if (e && e.shapes && e.shapes.length > 0) {
            let stickId: string;

            if (e.shapes[0] instanceof azmaps.Shape) {
                stickId = (<azmaps.Shape>e.shapes[0]).getProperties()._stickId;
            } else {
                stickId = (<azmaps.data.Feature<azmaps.data.Point, any>>e.shapes[0]).properties._stickId;
            }

            const info = { source: self._spiderDatasourceId, id: self._hoverStateId };
            const map = self._map;

            if (self._hoverStateId) {
                //TODO: replace with built-in function.
                //@ts-ignore
                map.map.setFeatureState(info, { hover: false });
            }

            self._hoverStateId = stickId;
            info.id = stickId;

            //TODO: replace with built-in function.
            //@ts-ignore
            map.map.setFeatureState(info, { hover: true });

            map.getCanvasContainer().style.cursor = 'pointer';
        }
    }

    /**
     * Event handler for when the user stops hovering over a feature and the stick joining it to a cluster should be unhighlighted.
     * @param e mouse event.
     */
    private _unhighlightStick = (e: azmaps.MapMouseEvent): void => {
        const self = this;
        if (self._hoverStateId) {
            //TODO: replace with built-in function.
            //@ts-ignore
            self._map.map.setFeatureState({ source: self._spiderDatasourceId, id: self._hoverStateId }, { hover: false });
            self._hoverStateId = null;

            self._map.getCanvasContainer().style.cursor = 'grab';
        }
    }
}
