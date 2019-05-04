/**
 * @typedef {Object} IPromiseParam
 * @property {string} promise The name of the person.
 */
interface ICallbackParam {
	data: any,
	params: any,
	keys: any,
}

interface ICallbackFunction {
	/**
	 * @param {any} arg0 Dispatcher object payload
	 * @returns {Promise<any>} Promise when Dispatched function is done
	 */
	callback: (arg0: ICallbackParam) => any;
}

/**
 * @template K Action key(s) type
 * @template O parameters passed on dispatch
 * @template AR Dispatched action return type
 */

export class Dispatcher<K extends object, AR = void, O = undefined> {
	private registry: Array<K & ICallbackFunction> = [];
	private keys: string[];
	/**
	 * Create Dispatcher
	 * @param {Array<string>} keys which contains key(s) to find correct dispatch Promise
	 */
	constructor(keys: Array<keyof K>) {
		this.keys = keys as string[];
	}
	/**
	 * Validate keys from action object
	 * @param entry
	 */
	public isValid(action: object) {
		let ret = true;
		this.keys.forEach((key) => {
			if (!(key in action)) {
				ret = false;
			}
		});
		return ret;
	}
	/**
	 * Attach Action to target key(s)
	 * @param {object} register as Action target where object keys are valid for constructor key array
	 * @param {({data: T, params: O, keys: K}) => AR} callback register callback function
	 * @returns {number} id number
	 * @template T data type returned for action
	 * @template O parameters passed on dispatch
	 * @template K keys from dispatch action
	 * @template AR Dispatched action return type
	 */
	public addAction<T>(register: K, callback: (output:{data: T, params: O, keys: K}) => AR): number {
		const index = this.registry.length;
		const callbackData = {...(register as object), callback} as K & ICallbackFunction;
		this.registry.push(callbackData);
		return index;
	}
	/**
	 * Remove Promise from target key(s)
	 * @param id to use remove promise
	 */
	public removeAction(id: number) {
		this.registry.splice(id, 1);
	}
	/**
	 * Dispatch payload
	 * @param action payload
	 * @param options pass data to Dispatch Promise
	 * @returns {Array<any>} Array of Data
	 */
	public dispatch(action: K, options: O): AR[] {
		const pairs = this.getKeyPairs(action);
		const regs = this.findRegistryEntries(pairs);
		const out: ICallbackParam = {
			data: this.removeKeys(action),
			keys: this.getKeys(action),
			params: options,
		}
		return regs.map((reg) => reg.callback(out));
	}
	/**
	 * Check that we have all needed keys
	 * @param {object} data which should contain needed keys
	 */
	private getKeyPairs(data: K) {
		let found = true;
		const pairs = {};
		this.keys.forEach((key) => {
			if (!(key in data)) {
				found = false;
			} else {
				pairs[key] = data[key];
			}
		});
		if (!found) {
			throw new Error('No keys found');
		}
		return pairs;
	}
	/**
	 * Remove keys from payload
	 * @param {object} data payload
	 * @returns {object} without Dispatch keys
	 */
	private removeKeys(data: K) {
		const payload = {...(data as object)};
		this.keys.forEach((k) => {
			delete payload[k];
		});
		return payload;
	}
	private getKeys(data: K): K {
		const out:any = {};
		this.keys.forEach((k) => {
			out[k] = data[k];
		});
		return out as K;
	}
	/**
	 * Find Action from registry
	 * @param pairs keys to find Promises
	 */
	private findRegistryEntries(pairs: object): Array<K & ICallbackFunction> {
		return this.registry.filter((r) => this.doWeHaveAllKeys(pairs, r));
	}
	/**
	 * Check if filter keys and registry entity keys match (and exists)
	 * @param pairs filter keys
	 * @param entry registry entry
	 */
	private doWeHaveAllKeys(pairs: object, entry: K & ICallbackFunction): boolean {
		let ret = true;
		Object.keys(pairs).forEach((key) => {
			if (!(key in entry) || entry[key] !== pairs[key]) {
				ret = false;
			}
		});
		return ret;
	}
}
