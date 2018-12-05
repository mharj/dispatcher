
import {Dispatcher} from '../src';

interface Ikeys {
	_act: string;
}

interface IData {
	value: string;
}

const dis = new Dispatcher<Ikeys>(['_act']);
const dispKey: Ikeys = {_act: 'data'};
dis.addAction<IData>(dispKey, (data) => {
	console.log(data.value+' simple action');
});

const payload: Ikeys & IData = {_act: 'data', value: 'hello'};
dis.dispatch(payload);