import {Dispatcher} from '../src';

// websocket mockup
class WebSocket {
	constructor(url: string) {
		// ignore
	}
	public send(msg: string) {
		console.log(msg);
	}
}

interface IKeys {
	_act: string;
	_type: string;
}

interface IData {
	value: string;
}

interface IOptions {
	websocket: any;
}

// create Dispatcher with "IKeys" dual keys, no return "void" values from Action, "IOptions" passed to action on dispatch
const dis = new Dispatcher<IKeys, void, IOptions>();
// attach
const dispKey: IKeys = {_act: 'websocket', _type: 'data'};
const actIndex = dis.addAction<IData>(dispKey, ({data, params}) => {
	if (params) {
		params.websocket.send('multi key ' + data.value);
	}
});
// start some action
const websocket = new WebSocket('');
const payload: IKeys & IData = {_act: 'websocket', _type: 'data', value: 'demo'};
const options: IOptions = {websocket};
dis.dispatch(payload, options);
// we are done ... remove action function
dis.removeAction(actIndex);
