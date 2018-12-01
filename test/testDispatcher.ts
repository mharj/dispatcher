import {expect} from 'chai';
import {describe, it} from 'mocha';
import {Dispatcher} from '../src/index';

interface ITest {
	_act: string;
}

interface IData {
	test: string,
}

describe('reducer', () => {
	describe('#addRegister', () => {
		it('should return resolve promise', (done) => {
			const dis = new Dispatcher<ITest, string>(['_act']);
			const dispKey: ITest = {_act: 'data'};
			dis.addPromise<IData>(dispKey, (data) => {
				return Promise.resolve(data.test);
			});

			const payload: IData & ITest = {_act: 'data', test: 'demo'};
			dis.dispatch(payload)
				.then(() => {
					done();
				})
				.catch( (err) => {
					done(err);
				});
		});
		it('should return reject promise if not found', (done) => {
			const dis = new Dispatcher<ITest, string>(['_act']);
			const dispKey: ITest = {_act: 'data'};
			dis.addPromise<IData>(dispKey, (data) => {
				return Promise.resolve(data.test);
			});

			const payload: IData & ITest = {_act: 'qwe', test: 'demo'};
			dis.dispatch(payload)
				.then(() => {
					done(new Error('should not happen'));
				})
				.catch( (err) => {
					done();
				});
		});
		it('should resolve multiple promises', (done) => {
			const dis = new Dispatcher<ITest, string>(['_act']);
			const dispKey: ITest = {_act: 'data'};
			let value = 0;
			const index0 = dis.addPromise<IData>(dispKey, (data) => {
				value+=1;
				return Promise.resolve('0');
			});
			const index1 = dis.addPromise<IData>(dispKey, (data) => {
				value+=2;
				return Promise.resolve('1');
			});
			const index2 = dis.addPromise<IData>(dispKey, (data) => {
				value+=3;
				return Promise.resolve('2');
			});
			expect(index0).to.be.eq(0);
			expect(index1).to.be.eq(1);
			expect(index2).to.be.eq(2);
			dis.removePromise(index0);
			const payload: IData & ITest = {_act: 'data', test: 'demo'};
			dis.dispatch(payload)
				.then((data) => {
					expect(value).to.be.eq(5);
					expect(data).to.be.eql(['1','2']);
					done();
				})
				.catch( (err) => {
					done(err);
				});
		});
	});
});
