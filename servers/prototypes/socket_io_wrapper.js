
const log = require("../../logger.js");
const assert = require("../../asserter.js");
const rw = require("../../reader_writer.js");
const handleDom5Data = require("../../games/dominions5_runtime_data_handler.js");
const { TimeoutError, SocketResponseError } = require("../../errors/custom_errors");

module.exports = SocketWrapper;

function SocketWrapper(socketIoObject)
{
    const _socketIoObject = socketIoObject;

    this.getId = () => _socketIoObject.id;

    this.close = (shouldCloseConnection = true) => _socketIoObject.disconnect(shouldCloseConnection);

    this.terminate = () => this.close(true);

    this.onDisconnect = (fnToCall) => _socketIoObject.on("disconnect", (reason) => fnToCall(reason));

    this.emit = (trigger, data) => _socketIoObject.emit(trigger, data);

    this.emitPromise = (trigger, data, timeout = 60000) =>
    {
        return new Promise((resolve, reject) =>
        {
            var receivedResponse = false;

            _socketIoObject.emit(trigger, data, function handleResponse(errMessage, returnData)
            {
                receivedResponse = true;

                if (errMessage != null)
                    return reject(new SocketResponseError(`Request ${trigger} response error: ${errMessage}`));

                else return resolve(returnData);
            });

            if (assert.isInteger(timeout) === true && timeout > 0)
            {
                setTimeout(function handleTimeout()
                {
                    if (receivedResponse === false)
                    {
                        log.general(log.getVerboseLevel(), `Request ${trigger} timed out without a response from server. Data sent was:\n\n${rw.JSONStringify(data)}`);
                        reject(new TimeoutError(`Request ${trigger} timed out without a response from server.`));
                    }
    
                }, timeout);
            }
        });
    };

    this.onMessage = (trigger, handler) =>
    {
        return new Promise((resolve, reject) =>
        {
            _socketIoObject.on(trigger, function(response, callback)
            {
                Promise.resolve(handler(response))
                .then((handlerReturnValue) => 
                {
                    callback(handlerReturnValue);
                    resolve();
                })
                .catch((err) => reject(err));
            });
        });
    };

    
    this.onMessage("STDIO_DATA", (data) => 
    {
        log.general(log.getVerboseLevel(), `${data.name}: ${data.type} data received`, data.data);
        handleDom5Data(data.name, data.data);
    });

    this.onMessage("GAME_ERROR", (data) => 
    {
        log.error(log.getLeanLevel(), `${data.name} REPORTED GAME ERROR`, data.error);
        handleDom5Data(data.name, data.error);
    });
}