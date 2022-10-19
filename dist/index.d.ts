import { Command, CommandResponse, Event, EventResponse, ExecuteCommandArgs, InitializationOptions, Options } from './types';
declare class AppExtensionsSDK {
    private readonly identifier;
    private initialized;
    private window;
    constructor(options?: Options);
    private postMessage;
    execute<K extends Command>(command: K, ...args: ExecuteCommandArgs<K>): Promise<CommandResponse<K>>;
    private track;
    listen<K extends Event>(event: K, onEventReceived: (response: EventResponse<K>) => void): () => void;
    setWindow(window: Window): void;
    initialize(options?: InitializationOptions): Promise<this>;
}
export { Command, Event, Modal, ModalStatus, Color, TrackingEvent, MessageType, View, VisibilityEventInvoker, } from './types';
export default AppExtensionsSDK;
