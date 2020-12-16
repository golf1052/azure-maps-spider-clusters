import { SpiderClusterManager } from '../SpiderClusterManager';
import { SpiderClusterEventArg } from '../SpiderClusterEventArg';

/**
 * This module partially defines the map control.
 * This definition only includes the features added by using the drawing tools.
 * For the base definition see:
 * https://docs.microsoft.com/javascript/api/azure-maps-control/?view=azure-maps-typescript-latest
 */
declare module "azure-maps-control" {
    /**
     * This interface partially defines the map control's `EventManager`.
     * This definition only includes the method added by using the drawing tools.
     * For the base definition see:
     * https://docs.microsoft.com/javascript/api/azure-maps-control/atlas.eventmanager?view=azure-maps-typescript-latest
     */
    export interface EventManager {
        /**
         * Adds an event to the `SpiderClusterManager`.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "featureSelected", target: SpiderClusterManager, callback: (e: SpiderClusterEventArg) => void): void;

        /**
         * Adds an event to the `SpiderClusterManager`.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to add the event for.
         * @param callback The event handler callback.
         */
        add(eventType: "featureUnselected", target: SpiderClusterManager, callback: () => void): void;

        /**
         * Adds an event to the `SpiderClusterManager` once.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "featureSelected", target: SpiderClusterManager, callback: (e: SpiderClusterEventArg) => void): void;

        /**
         * Adds an event to the `SpiderClusterManager` once.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to add the event for.
         * @param callback The event handler callback.
         */
        addOnce(eventType: "featureUnselected", target: SpiderClusterManager, callback: () => void): void;
        
        /**
         * Removes an event listener from the `SpiderClusterManager`.
         * @param eventType The event name.
         * @param target The `SpiderClusterManager` to remove the event for.
         * @param callback The event handler callback.
         */
        remove(eventType: string, target: SpiderClusterManager, callback: (e?: any) => void): void;
    }
}