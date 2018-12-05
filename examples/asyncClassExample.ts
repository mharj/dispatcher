import {Dispatcher} from '../src';

interface IAction<T> {
	run: () => T;
}

abstract class AsyncAction implements IAction<Promise<string>>  {
	public value: string;
	public run() {
		return Promise.resolve(this.value);
	}
}

abstract class Action implements IAction<string> {
	public value: string;
	public run() {
		return this.value;
	}
}

class DemoAsyncAction extends AsyncAction {
	constructor(data: IData) {
		super();
		this.value = 'DemoAsyncAction - ' + data.test;
	}
}

class DemoAction extends Action {
	constructor(data: IData) {
		super();
		this.value = 'DemoAction - ' + data.test;
	}
}

interface IKey {
	_act: string;
}

interface IData {
	test: string;
}

const dis = new Dispatcher<IKey, AsyncAction | Action>(['_act']);
const dispKey: IKey = {_act: 'data'};
dis.addAction<IData>(dispKey, (data) => new DemoAction(data));
dis.addAction<IData>(dispKey, (data) => new DemoAsyncAction(data));
// dispatch
const payload: IData & IKey = {_act: 'data', test: 'demo'};
let actionList = dis.dispatch(payload);
// run actions and async actions
Promise.all(actionList.map((a) => a.run())).then((data) => {
	console.log(data);
});
