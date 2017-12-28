import { EventEmitter } from "./event_emitter";
import { AppEvent } from "./app_event";

function ViewSettings(templateUrl : string, container : string) {

  return function(target : any) {

    var original = target;

    function construct(constructor, args) {
      
      var c : any = function() {
        return constructor.apply(this, args);
      }

      c.prototype = constructor.prototype;
      var instance = new c();
      instance._container = container;
      instance._templateUrl = templateUrl;
      return instance;

    }

    var f : any = function(...args) {
      return construct(original, args);
    }

    f.prototype = original.prototype;

    return f;
  }

}

class View extends EventEmitter implements IView {

  // the values of _container and _templateUrl must be set using the ViewSettings decorator
  protected _container : string;
  private _templateUrl : string;

  private _templateDelegate : HandlebarsTemplateDelegate;

  constructor(mediator : IMediator) {
    super(mediator);
  }

  // must be implemented by derived classes
  public initialize() {
    throw new Error("View.prototype.initialize() is abstract and must be implemented.");
  }

  // must be implemented by derived classes
  public dispose() {
    throw new Error("View.prototype.dispose() is abstract and must be implemented.");
  }

  // must be implemented by derived classes
  protected bindDomEvents(model : any) {
    throw new Error('View.prototype.bindDomEvents() is abstract and must be implemented.');
  }

  // must be implemented by derived classes
  protected unbindDomEvents() {
    throw new Error('View.prototype.unbindDomEvents() is abstract and must be implemented');
  }

  // asynchroniusly loads a template
  private loadTemplateAsync() {
    return Q.Promise((resolve : (r) => {}, reject : (e) => {}) => {
      $.ajax({
        method: "GET",
        url: this._templateUrl,
        dataType: "text",
        success: (response) => {
          resolve(response);
        },
        error : (...args : any[]) => {
          reject(args);
        }
      });
    });
  }

  // asynchroniusly compile a template
  private compileTemplateAsync(source: string) {
    return Q.Promise((resolve : (r) => {}, reject : (e) => {}) => {
      try {
        var template = Handlebars.compile(source);
        resolve(template);
      } catch(e) {
        reject(e);
      }
    });
  }

  // asynchroniusly loads and compile a template if not done already
  private getTemplateAsync() {
    return Q.Promise((resolve : (r) => {}, reject : (e) => {}) => {
      if(this._templateDelegate === null) {
        this.loadTemplateAsync()
            .then((source) => {
              return this.compileTemplateAsync(source);
            })
            .then((templateDelegate) => {
              this._templateDelegate = templateDelegate;
              resolve(this._templateDelegate);
            })
            .catch((e) => { reject(e); })
      } else {
        resolve(this._templateDelegate);
      }
    });
  }

  // asynchroniusly renders the view
  protected renderAsync(model) {
    return Q.Promise((resolve : (r) => {}, reject : (e) => {}) => {
      this.getTemplateAsync()
          .then((templateDelegate) => {
            // generate html and append to the DOM
            var html = this._templateDelegate(model);
            $(this._container).html(html);

            // pass model to resolve so it can be used by
            // subviews and DOM event initializer
            resolve(model);
          })
          .catch((e) => { reject(e); });
    });
  }
}

export { View, ViewSettings };