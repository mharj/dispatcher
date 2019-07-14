/**
 * @typedef {Object} IPromiseParam
 * @property {string} promise The name of the person.
 */
interface ICallbackParam {
	data: any;
	params: any;
	keys: any;
	action: any;
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
	private keys: string[][] = [];
	/**
	 * Validate keys from action object
	 * @param entry
	 */
	public isValid(action: object): action is K & object {
		return this.getKeyPairs(action as K) ? true : false;
	}

	/**
	 * Attach Action to target key(s)
	 * @param {object} register as Action target where object keys are valid for constructor key array
	 * @param {({data: T, params: O, keys: K, action: T & K}) => AR} callback register callback function
	 * @returns {number} id number
	 * @template T data type returned for action
	 * @template O parameters passed on dispatch
	 * @template K keys from dispatch action
	 * @template AR Dispatched action return type
	 * callback options
	 * data: action data without keys
	 * params: parameters passed from dispatch
	 * keys: action keys
	 * action: original action with keys (i.e. passing to sub dispatcher)
	 */
	public addAction<T>(register: K, callback: (output: {data: Readonly<T>; params: Readonly<O>; keys: Readonly<K>; action: Readonly<K & T>}) => AR): number {
		if (!this.isValid(register)) {
			this.keys.push(Object.keys(register));
		}
		const index = this.registry.length;
		const callbackData = {...(register as object), callback} as K & ICallbackFunction;
		this.registry.push(callbackData);
		return index;
	}
	/**
	 * Remove Promise from target key(s)
	 * @param id to use remove promise
	 */
	public removeAction(id: number): void {
		this.registry.splice(id, 1);
	}
	/**
	 * Dispatch payload
	 * @param action payload
	 * @param options pass data to Dispatch Promise
	 * @returns {Array<any>} Array of Data
	 */
	public dispatch(action: K, options?: O): AR[] {
		const keys = this.getKeyPairs(action);
		if (!keys) {
			return [];
		}
		const regs = this.findRegistryEntries(keys, action);
		const out: ICallbackParam = {
			action,
			data: this.removeKeys(keys, action),
			keys: this.getKeys(keys, action),
			params: options,
		};
		return regs.map((reg) => reg.callback(out));
	}
	/**
	 * Check that we have all needed keys
	 * @param {object} data which should contain needed keys
	 */
	private getKeyPairs(data: K): string[] | undefined {
		for (const keySet of this.keys) {
			const ret = keySet.reduce((prev, curr, idx) => {
				return prev && curr in data;
			}, true);
			if (ret) {
				return keySet;
			}
		}
		return;
	}
	/**
	 * Remove keys from payload
	 * @param {object} action payload
	 * @returns {object} without Dispatch keys
	 */
	private removeKeys(keys: string[], action: K & object): object {
		const payload = {...(action as object)};
		keys.forEach((k) => {
			delete payload[k];
		});
		return payload;
	}
	/**
	 * getKeys retuns object which contains current keys
	 * @param data current dispatch action
	 * @return {object} with Dispatch keys
	 */
	private getKeys(keys: string[], action: K & object): K {
		const out: any = {};
		keys.forEach((k) => {
			out[k] = action[k];
		});
		return out as K;
	}
	/**
	 * Find Action from registry
	 * @param keys we need to validate
	 * @param action current dispatch action
	 */
	private findRegistryEntries(keys: string[], action: K): Array<K & ICallbackFunction> {
		return this.registry.filter((r) => this.doWeHaveAllKeys(keys, r, action));
	}
	/**
	 * Check if filter keys and registry entity keys match (and exists)
	 * @param keys we need to validate
	 * @param entry registry entry
	 * @param action current dispatch action
	 */
	private doWeHaveAllKeys(keys: string[], entry: K & ICallbackFunction, action: K): boolean {
		for (const key of keys) {
			if (!(key in entry) || !(key in action)) {
				// source or target key was not found
				return false;
			}
			if (entry[key] !== action[key]) {
				// key value is different
				return false;
			}
		}
		return true; // we have all keys and values matching
	}
}
