import {expect} from 'chai';
import {describe, it} from 'mocha';
import {Dispatcher} from '../src/index';

interface ITest {
	_act: string;
}

interface ITestDual {
	_act: string;
	_type: string;
}

interface IData {
	test: string;
}

interface IOptions {
	extraValue: number;
}

describe('dispatcher', () => {
	it('should return resolve promise', (done) => {
		const dis = new Dispatcher<ITest, Promise<string>>(['_act']);
		const dispKey: ITest = {_act: 'data'};
		dis.addAction<IData>(dispKey, (data) => {
			return Promise.resolve(data.test);
		});

		const payload: IData & ITest = {_act: 'data', test: 'demo'};
		let actionList = dis.dispatch(payload);
		Promise.all(actionList)
			.then(() => {
				done();
			})
			.catch((err) => {
				done(err);
			});
	});
	it('should resolve multiple promises', (done) => {
		const dis = new Dispatcher<ITest, Promise<string>, IOptions>(['_act']);
		const dispKey: ITest = {_act: 'data'};
		let value = 0;
		const index0 = dis.addAction<IData>(dispKey, (data, options) => {
			value += 1;
			if (options) {
				value += options.extraValue;
			}
			return Promise.resolve('0');
		});
		const index1 = dis.addAction<IData>(dispKey, (data, options) => {
			value += 2;
			if (options) {
				value += options.extraValue;
			}
			return Promise.resolve('1');
		});
		const index2 = dis.addAction<IData>(dispKey, (data, options) => {
			value += 3;
			if (options) {
				value += options.extraValue;
			}
			return Promise.resolve('2');
		});
		expect(index0).to.be.eq(0);
		expect(index1).to.be.eq(1);
		expect(index2).to.be.eq(2);
		dis.removeAction(index0);
		const payload: IData & ITest = {_act: 'data', test: 'demo'};
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
		const dis = new Dispatcher<ITestDual, string>(['_act', '_type']);
		expect(dis.isValid({_act: 'asd', _type: 'qwe'})).to.be.true;
		expect(dis.isValid({_type: 'qwe'})).to.be.false;
		expect(dis.isValid({_act: 'asd'})).to.be.false;
		expect(dis.isValid({_other: 'asd'})).to.be.false;
		done();
	});
});
