  class CContextMenu extends CWindow 
  {
  
      // Default settings
      settings = {
          
      };
  
      constructor(modifierId, json) {
  
          super();
  
          this.modifierId = modifierId;
          this.commandId = -1;
      }
  
      onAddElement() {
          super.onAddElement();

      }
  
      onRemoveElement() {
          super.onRemoveElement();
      }
  
      render()
      {
          //picker
          var menu = super.render();
          menu.className = 'context-menu';
           
          return menu;
      }
}
  
CONTEXT_MENU = null;
function openContextMenu(id, point, json)
{
    console.log("openContextMenu function");
    if (!CONTEXT_MENU) {
      CONTEXT_MENU = new CContextMenu(id, json, point, getModuleWnd());
      CONTEXT_MENU.add(document.body, 'context-menu');
      addListener(CONTEXT_MENU.getElement(), 'window:close', closeContextMenu)
    }
}

function closeContextMenu()
{
    console.log("closeContextMenu function");

    if (CONTEXT_MENU) {
        removeListener(CONTEXT_MENU.getElement(), 'window:close', closeContextMenu);

        CONTEXT_MENU.remove();
        Module.ccall('CallMenuCommand', 'number', ['number', 'number'], [CONTEXT_MENU.modifierId, CONTEXT_MENU.commandId]);        
        CONTEXT_MENU = null;
    }
}