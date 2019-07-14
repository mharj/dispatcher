
import {Dispatcher} from '../src';

interface IKeys {
	_act: string;
}

interface IData {
	value: string;
}

const dis = new Dispatcher<IKeys>();
const dispKey: IKeys = {_act: 'data'};
dis.addAction<IData>(dispKey, ({data}) => {
	console.log(data.value+' simple action');
});

const payload: IKeys & IData = {_act: 'data', value: 'hello'};
dis.dispatch(payload);