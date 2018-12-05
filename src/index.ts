/**
 * @typedef {Object} IPromiseParam
 * @property {string} promise The name of the person.
 */
interface ICallbackParam {
	/**
	 * @param {any} arg0 Dispatcher object payload
	 * @returns {Promise<any>} Promise when Dispatched function is done
	 */
	callback: (arg0: any, options?: any) => any;
}

/**
 * @template K Action key(s) type
 * @template AR Dispatched action return type
 */

export class Dispatcher<K extends object, AR = void, O = undefined> {
	private registry: Array<K & ICallbackParam> = [];
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
	 * @param {(arg: object, options: object) => Promise<any>} callback register callback function
	 * @returns {number} id number
	 * @template T Dispatched Promise argument type
	 */
	public addAction<T>(register: K, callback: (arg0: T, options?: O) => AR): number {
		const index = this.registry.length;
		const data = {...(register as object), callback} as K & ICallbackParam;
		this.registry.push(data);
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
	public dispatch(action: K, options?: O): AR[] {
		const pairs = this.getKeyPairs(action);
		const regs = this.findRegistryEntries(pairs);
		return regs.map((reg) => reg.callback(this.removeKeys(action), options));
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
	/**
	 * Find Action from registry
	 * @param pairs keys to find Promises
	 */
	private findRegistryEntries(pairs: object): Array<K & ICallbackParam> {
		return this.registry.filter((r) => this.doWeHaveAllKeys(pairs, r));
	}
	/**
	 * Check if filter keys and registry entity keys match (and exists)
	 * @param pairs filter keys
	 * @param entry registry entry
	 */
	private doWeHaveAllKeys(pairs: object, entry: K & ICallbackParam): boolean {
		let ret = true;
		Object.keys(pairs).forEach((key) => {
			if (!(key in entry) || entry[key] !== pairs[key]) {
				ret = false;
			}
		});
		return ret;
	}
}
