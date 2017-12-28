class EventEmitter implements IEventEmitter {
  protected _mediator : IMediator;
  protected _events : Array<IAppEvent>;

  constructor(mediator : IMediator) {
    this._mediator = mediator;
  }

  public triggerEvent(event : IAppEvent) {
    this._mediator.publish(event);
  }

  public subscribeToEvents(events : Array<IAppEvent>) {
    this._events = events;
    for(var i = 0; i < this._events.length; i++) {
      this._mediator.subscribe(this._events[i]);
    }
  }

  public unsubscribeToEvents() {
    for(var i = 0; i < this._events.length; i++) {
      this._mediator.unsubscribe(this._events[i]);
    }
  }
}

export { EventEmitter };