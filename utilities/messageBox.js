class CMessageBox extends CWindow 
{

    // Default settings
    message_box_settings = {
        text: "",
    };

    constructor(text) {

        super();

        this.text = text;
    }

    onAddElement()
    {
        super.onAddElement();

        // Reference the UI elements
        this.messageBox = this.getElement();
    }

    onRemoveElement(){

        super.onRemoveElement();
    }

    render()
    {
        //picker
        var messageBox = super.render();
        messageBox.className = 'message-box';
        messageBox.innerText = this.message_box_settings.text;
  
        return messageBox;
    }
}


MESSAGE_BOX = null;

function openMessageBox(title, text)
{
    console.log("openMessageBox function");
    if (!MESSAGE_BOX) {
        MESSAGE_BOX = new CModalDialog(new CMessageBox(text));
        MESSAGE_BOX.modal_settings.title = title;
        MESSAGE_BOX.add(document.body, 'message-box');
        addListener(MESSAGE_BOX.getElement(), 'window:close', closeMessageBox)
    }
}

function closeMessageBox()
{
    console.log("closeMessageBox function");

    if (MESSAGE_BOX) {
        removeListener(MESSAGE_BOX.getElement(), 'window:close', closeMessageBox);
        MESSAGE_BOX.remove();
        MESSAGE_BOX = null;
    }
}