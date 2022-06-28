---
page_type: sample
description: A module for the Azure Maps Web SDK that adds a visualization to the map which expands clusters into a spiral spider layout.
languages:
- javascript
- typescript
products:
- azure
- azure-maps
---

# Azure Maps Spider Clusters module

A module for the Azure Maps Web SDK that adds a visualization to the map which expands clusters into a spiral spider layout.

**Samples**

[Expanding Spider Clusters](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Expanding%20Spider%20Clusters)
<br/>[<img src="https://github.com/Azure-Samples/AzureMapsCodeSamples/raw/vnext/Samples/Symbol%20Layer/Expanding%20Spider%20Clusters/screenshot.gif" height="200px">](https://azuremapscodesamples.azurewebsites.net/index.html?sample=Expanding%20Spider%20Clusters)

## Getting started

Download the project and copy the `azure-maps-spider-clusters` JavaScript file from the `dist` folder into your project. 

**Usage**

```JavaScript
//Create a data source and add it to the map.
datasource = new atlas.source.DataSource(null, {
    cluster: true
});
map.sources.add(datasource);

//Create a layer for rendering clustered data points.
var clusterBubbleLayer = new atlas.layer.BubbleLayer(datasource, null, {
    radius: 20,
    color: 'purple',
    strokeWidth: 0,
    //Only rendered data points which have a point_count property, which clusters do.
    filter: ['has', 'point_count'] 
});

//Create a layer to render the individual features.
var featureLayer = new atlas.layer.SymbolLayer(datasource, null, {
    //Filter out clustered points from this layer.
    filter: ['!', ['has', 'point_count']] 
});

//Add the layers to the map.
map.layers.add([
    clusterBubbleLayer,

    //Optionally, create a symbol layer to render the count of features in a cluster.
    new atlas.layer.SymbolLayer(datasource, null, {
        iconOptions: {
            image: 'none' //Hide the icon image.
        },
        textOptions: {
            textField: ['get', 'point_count_abbreviated'],
            offset: [0, 0.4],
            color: 'white'
        }
    }),

    featureLayer
]);

//Create an instance of the spider manager.
var spiderManager = new atlas.SpiderClusterManager(map, clusterBubbleLayer, featureLayer);

//Optionally, add event handler for when a feature is selected.
map.events.add('featureSelected', spiderManager, function(e) {
    //Do something with the selected feature.
});

//Optionally, add event handler for when a feature is unselected.
map.events.add('featureUnselected', spiderManager, function() {
    //Do something now that feature was unselected.
});
```

## API Reference

### SpiderClusterManager class

Namespace: `atlas`

Adds a visualization to the map which expands clusters into a spiral spider layout.

**Contstructor**

> `SpiderClusterManager(map: atlas.Map, clusterLayer: atlas.layer.BubbleLayer | atlas.layer.SymbolLayer, unclustedLayer: atlas.layer.BubbleLayer | atlas.layer.SymbolLayer, options?: SpiderClusterOptions)`

* map - An Azure Maps instance.
* clusterLayer - The rendering layer used for displaying clustered data.
* unclustedLayer - The rendering layer used for displaying unclustered data (individual features).
* options - Initial options to set on the manager.

**Methods** 

| Name | Return type | Description |
|------|-------------|-------------|
| `dispose()` | | Disposes the `SpiderClusterManager` and releases it's resources. |
| `getOptions()` | `SpiderClusterOptions` | Gets the options of the `SpiderClusterManager`. |
| `getLayers()` | `SpiderClusterLayers` | Gets all layers managed by the spider cluster manager. |
| `hideSpiderCluster()` | | Collapses any open/expanded spider clusters. |
| `setOptions(options: SpiderClusterOptions)` | | Sets the options used to customize how the `SpiderClusterManager` renders clusters. |
| `showSpiderCluster(cluster: atlas.data.Feature<atlas.data.Point, atlas.ClusteredProperties>)` | | Expands a cluster into it's open spider layout. |

**Events**

| Name | Return type | Description |
|------|-------------|-------------|
| `featureSelected` | `SpiderClusterEventArg` | Event fired when an individual point feature is clicked. If the point feature is part of a cluster, the cluster will also be returned in event arguments. |
| `featureUnselected` | | Event fired when a point feature is unselected or a spider cluster is collapsed. |

### SpiderClusterOptions interface

Options used to customize how the `SpiderClusterManager` renders clusters.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `circleSpiralSwitchover` | `number` | Minimium number of point features in cluster before switching from circle to spiral spider layout. Default: `6` |
| `closeWebOnPointClick` | `boolean` | A boolean indicating if the expanded spider web should be closed when one of it's points are clicked. Default: `true` |
| `maxFeaturesInWeb` | `number` | The maximum number of features that can be rendered in the spider layout. When the cluster is bigger than this value, it will zoom until the cluster starts to break apart. Default: `100` |
| `minCircleLength` | `number` | The minimum pixel distance between point features and the cluster, when rendering spider layout as a circle. Default: `30` |
| `minSpiralAngleSeperation` | `number` | The minimum angle between point features in the spiral. Default: `25` |
| `spiralDistanceFactor` | `number` | A factor that is used to grow the pixel distance of each point feature from the center in the spiral. Default: `5` |
| `stickLayerOptions` | `atlas.LineLayerOptions` | Layer options used to style the stick connecting the individual point feature to the cluster. The default is a thin red line. |
| `visible` | `boolean` | A boolean indicating if the expanded spider visualization should be displayed or not. Default: `true`  |

### SpiderClusterLayers interface

An object that contains all the layers within a spider cluster manager.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `clusterLayer` | `atlas.layer.BubbleLayer` \| `atlas.layer.SymbolLayer` | The provided layer that renders clustered data. |
| `spiderFeatureLayer` | `atlas.layer.BubbleLayer` \| `atlas.layer.SymbolLayer` | An internal layer that renders features within a cluster. Grabs style options from the `unclustedLayer` when `SpiderClusterManager` initialized. |
| `spiderLineLayer` | `atlas.layer.LineLayer` | An internal layer used to render connecting lines between preview features and their respective cluster. |
| `unclustedLayer` | `atlas.layer.BubbleLayer` \| `atlas.layer.SymbolLayer` | The provided layer that renders unclustered data. |

### SpiderClusterEventArg interface

Event argument for when a feature in a spider cluster is selected.

**Properties** 

| Name | Type | Description |
|------|------|-------------|
| `cluster` | `atlas.data.Feature<atlas.data.Point, any>` | The cluster the selected feature belongs to. |
| `shape` | `atlas.Shape` | The shape feature that was selected. |

## Related Projects

**Open Azure Maps Web SDK modules**

* [Azure Maps Animation module](https://github.com/Azure-Samples/azure-maps-animations)
* [Azure Maps Geolocation Control module](https://github.com/Azure-Samples/azure-maps-geolocation-control)
* [Azure Maps Fullscreen Control module](https://github.com/Azure-Samples/azure-maps-fullscreen-control)
* [Azure Maps Selection Control module](https://github.com/Azure-Samples/azure-maps-selection-control)
* [Azure Maps Services UI module](https://github.com/Azure-Samples/azure-maps-services-ui)
* [Azure Maps Sync Map module](https://github.com/Azure-Samples/azure-maps-sync-maps)

**Additional projects**

* [Azure Maps Web SDK Samples](https://github.com/Azure-Samples/AzureMapsCodeSamples)
* [Azure Maps Gov Cloud Web SDK Samples](https://github.com/Azure-Samples/AzureMapsGovCloudCodeSamples)
* [Azure Maps & Azure Active Directory Samples](https://github.com/Azure-Samples/Azure-Maps-AzureAD-Samples)
* [List of open-source Azure Maps projects](https://github.com/microsoft/Maps/blob/master/AzureMaps.md)

## Additional Resources

* [Azure Maps (main site)](https://azure.com/maps)
* [Azure Maps Documentation](https://docs.microsoft.com/azure/azure-maps/index)
* [Azure Maps Blog](https://azure.microsoft.com/blog/topics/azure-maps/)
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

## Contributing

We welcome contributions. Feel free to submit code samples, file issues and pull requests on the repo and we'll address them as we can. 
Learn more about how you can help on our [Contribution Rules & Guidelines](https://github.com/Azure-Samples/azure-maps-spider-clusters/blob/master/CONTRIBUTING.md). 

You can reach out to us anytime with questions and suggestions using our communities below:
* [Microsoft Q&A](https://docs.microsoft.com/answers/topics/azure-maps.html)
* [Azure Maps feedback](https://feedback.azure.com/forums/909172-azure-maps)

This project has adopted the [Microsoft Open Source Code of Conduct](https://opensource.microsoft.com/codeofconduct/). 
For more information, see the [Code of Conduct FAQ](https://opensource.microsoft.com/codeofconduct/faq/) or 
contact [opencode@microsoft.com](mailto:opencode@microsoft.com) with any additional questions or comments.

## License

MIT
 
See [License](https://github.com/Azure-Samples/azure-maps-spider-clusters/blob/master/LICENSE.md) for full license text.
