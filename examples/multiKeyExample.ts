import {Dispatcher} from '../src';

// websocket mockup
class WebSocket {
	constructor(url: string) {}
	public send(msg: string) {
		console.log(msg);
	}
}

interface Ikeys {
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
const dis = new Dispatcher<Ikeys, void, IOptions>(['_act', '_type']);
// attach
const dispKey: Ikeys = {_act: 'websocket', _type: 'data'};
const actIndex = dis.addAction<IData>(dispKey, (data, options) => {
	if (options) {
		options.websocket.send('multi key ' + data.value);
	}
});
// start some action
const websocket = new WebSocket('');
const payload: Ikeys & IData = {_act: 'websocket', _type: 'data', value: 'demo'};
const options: IOptions = {websocket};
dis.dispatch(payload, options);
// we are done ... remove action function
dis.removeAction(actIndex);
