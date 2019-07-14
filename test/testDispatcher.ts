import {expect} from 'chai';
import {describe, it} from 'mocha';
import {Dispatcher} from '../src/index';
// tslint:disable: no-unused-expression
interface ITestAct {
	_act: string;
}

interface ITestAck {
	_ack: string;
}

type ISplit = ITestAct | ITestAck;

interface ITestDualAct extends ITestAct {
	_type: string;
}

interface ITestDualAck {
	_ack: string;
	_hype: string;
}

type IDualSplit = ITestDualAct | ITestDualAck;

interface IData {
	test: string;
}

interface IOptions {
	extraValue: number;
}

describe('dispatcher', () => {
	it('should return resolve promise', (done) => {
		const dis = new Dispatcher<ITestAct, Promise<string>>();
		const dispKey: ITestAct = {_act: 'data'};
		dis.addAction<IData>(dispKey, ({data, params, keys, action}) => {
			expect(JSON.stringify(data)).to.be.eq(JSON.stringify({test: 'demo'}));
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_act: 'data'}));
			expect(JSON.stringify(action)).to.be.eq(JSON.stringify({_act: 'data', test: 'demo'}));
			expect(params).to.be.undefined;
			return Promise.resolve(data.test);
		});

		const payload: IData & ITestAct = {_act: 'data', test: 'demo'};
		expect(dis.isValid(payload)).to.be.eq(true);

		const actionList = dis.dispatch(payload);
		Promise.all(actionList)
			.then(() => {
				done();
			})
			.catch((err) => {
				done(err);
			});
	});
	it('should resolve multiple promises', (done) => {
		const dis = new Dispatcher<ITestAct, Promise<string>, IOptions>();
		const dispKey: ITestAct = {_act: 'data'};
		let value = 0;
		const index0 = dis.addAction<IData>(dispKey, ({params}) => {
			value += 1;
			if (params) {
				value += params.extraValue;
			}
			return Promise.resolve('0');
		});
		const index1 = dis.addAction<IData>(dispKey, ({keys, params, data}) => {
			expect(JSON.stringify(data)).to.be.eq(JSON.stringify({test: 'demo'}));
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_act: 'data'}));
			value += 2;
			if (params) {
				value += params.extraValue;
			}
			return Promise.resolve('1');
		});
		const index2 = dis.addAction<IData>(dispKey, ({params}) => {
			value += 3;
			if (params) {
				value += params.extraValue;
			}
			return Promise.resolve('2');
		});
		expect(index0).to.be.eq(0);
		expect(index1).to.be.eq(1);
		expect(index2).to.be.eq(2);
		dis.removeAction(index0);
		const payload: IData & ITestAct = {_act: 'data', test: 'demo'};
		Promise.all(dis.dispatch(payload, {extraValue: 1}))
			.then((data) => {
				expect(value).to.be.eq(7);
				expect(data).to.be.eql(['1', '2']);
				done();
			})
			.catch((err) => {
				done(err);
			});
	});
	it('should validate keys', (done) => {
		const dis = new Dispatcher<ITestDualAct, string>();
		const payload: ITestDualAct = {_act: 'asd', _type: 'qwe'};
		dis.addAction<IData>({_act: 'asd', _type: 'qwe'}, ({data, params, keys}) => {
			return 'data';
		});
		if (dis.isValid(payload)) {
			expect(payload._act).to.be.eq(payload._act);
			expect(payload._type).to.be.eq(payload._type);
		} else {
			throw new Error('should not happen');
		}

		expect(dis.isValid({_type: 'qwe'})).to.be.false;
		expect(dis.isValid({_act: 'asd'})).to.be.false;
		expect(dis.isValid({_other: 'asd'})).to.be.false;
		done();
	});
	it('should handle split payloads', (done) => {
		const dis = new Dispatcher<ISplit, string>();
		dis.addAction<IData>({_act: 'data'}, ({data, params, keys}) => {
			expect(JSON.stringify(data)).to.be.eq(JSON.stringify({test: 'demo1'}));
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_act: 'data'}));
			expect(params).to.be.undefined;
			return data.test;
		});
		dis.addAction<IData>({_ack: 'data'}, ({data, params, keys}) => {
			expect(JSON.stringify(data)).to.be.eq(JSON.stringify({test: 'demo2'}));
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_ack: 'data'}));
			expect(params).to.be.undefined;
			return data.test;
		});
		// ack
		let payload: IData & ISplit = {_act: 'data', test: 'demo1'};
		let actionList = dis.dispatch(payload);
		expect(actionList.length).to.be.eq(1);
		expect(actionList[0]).to.be.eq('demo1');
		// act
		payload = {_ack: 'data', test: 'demo2'};
		actionList = dis.dispatch(payload);
		expect(actionList.length).to.be.eq(1);
		expect(actionList[0]).to.be.eq('demo2');
		done();
	});
	it('should handle split multikey payloads', (done) => {
		const dis = new Dispatcher<IDualSplit, string>();
		dis.addAction<IData>({_act: 'data', _type: 'test'}, ({data, params, keys}) => {
			expect(JSON.stringify(data)).to.be.eq(JSON.stringify({test: 'demo1'}));
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_act: 'data', _type: 'test'}));
			expect(params).to.be.undefined;
			return data.test;
		});
		dis.addAction<IData>({_ack: 'data', _hype: 'test'}, ({data, params, keys}) => {
			expect(JSON.stringify(data)).to.be.eq(JSON.stringify({test: 'demo2'}));
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_ack: 'data', _hype: 'test'}));
			expect(params).to.be.undefined;
			return data.test;
		});
		dis.addAction<IData>({_ack: 'data', _hype: 'test2'}, ({data, params, keys}) => {
			expect(JSON.stringify(data)).to.be.eq(JSON.stringify({test: 'demo3'}));
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_ack: 'data', _hype: 'test2'}));
			expect(params).to.be.undefined;
			return data.test;
		});
		// ack
		let payload: IData & IDualSplit = {_act: 'data', _type: 'test', test: 'demo1'};
		let actionList = dis.dispatch(payload);
		expect(actionList.length).to.be.eq(1);
		expect(actionList[0]).to.be.eq('demo1');
		// act
		payload = {_ack: 'data', _hype: 'test', test: 'demo2'};
		actionList = dis.dispatch(payload);
		expect(actionList.length).to.be.eq(1);
		expect(actionList[0]).to.be.eq('demo2');
		// act + test2
		payload = {_ack: 'data', _hype: 'test2', test: 'demo3'};
		actionList = dis.dispatch(payload);
		expect(actionList.length).to.be.eq(1);
		expect(actionList[0]).to.be.eq('demo3');
		// no dispatch from wrong key
		payload = {_ack: 'data', _hype: 'qwe', test: 'qwe'};
		actionList = dis.dispatch(payload);
		expect(actionList.length).to.be.eq(0);
		// no dispatch from wrong key
		payload = {_ack: 'qwe', _hype: 'test', test: 'qwe'};
		actionList = dis.dispatch(payload);
		expect(actionList.length).to.be.eq(0);
		// should not work anyway
		payload = {} as IData & IDualSplit;
		actionList = dis.dispatch(payload);
		expect(actionList.length).to.be.eq(0);
		done();
	});
	it('should chain dispatching', (done) => {
		const disFirstLevel = new Dispatcher<ITestAct, void>();
		const disSecondLevel = new Dispatcher<ITestDualAct, void>();
		disFirstLevel.addAction<IData & {_type: string}>({_act: 'data'}, ({keys, action}) => {
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_act: 'data'}));
			expect(disSecondLevel.isValid(action)).to.be.eq(true);
			disSecondLevel.dispatch(action);
		});
		disSecondLevel.addAction<IData>({_act: 'data', _type: 'qwe'}, ({keys, data}) => {
			expect(JSON.stringify(keys)).to.be.eq(JSON.stringify({_act: 'data', _type: 'qwe'}));
			expect(JSON.stringify(data)).to.be.eq(JSON.stringify({test: 'asd'}));
			done();
		});
		const payload: ITestDualAct & IData = {_act: 'data', _type: 'qwe', test: 'asd'};
		expect(disFirstLevel.isValid(payload)).to.be.eq(true);
		const actionList = disFirstLevel.dispatch(payload);
		expect(actionList.length).to.be.eq(1);
	});
});
