/**
 * @typedef {Object} IPromiseParam
 * @property {string} promise The name of the person.
 */
interface IPromiseParam {
	/**
	 * @param {any} arg0 Dispatcher object payload
	 * @returns {Promise<any>} Promise when Dispatched function is done
	 */
	promise: (arg0: any) => Promise<any>;
}

/**
 * @template A Action key(s) type
 * @template PT Dispatched Promises return resolve type
 */

export class Dispatcher<A extends object, PT> {
	private registry: Array<A & IPromiseParam> = [];
	private keys: string[];
	/**
	 * Create Dispatcher
	 * @param {Array<string>} keys which contains key(s) to find correct dispatch Promise
	 */
	constructor(keys: Array<keyof A>) {
		this.keys = keys as string[];
	}
	/**
	 * Validate keys from action object
	 * @param entry
	 */
	public isValid(action: object) {
		let ret = true;
		this.keys.forEach((key) => {
			if (!(key in action) ) {
				ret = false;
			}
		});
		return ret;
	}
	/**
	 * Attach Promise to target key(s)
	 * @param {object} register as Action target where object keys are valid for constructor key array
	 * @param {(arg: object) => Promise<any>} promise register promise function which returns new Promise when done
	 * @returns {number} id number
	 * @template T Dispatched Promise argument type
	 */
	public addPromise<T>(register: A, promise: (arg0: T) => Promise<PT>): number {
		const index = this.registry.length;
		const data = {...(register as object), promise} as A & IPromiseParam;
		this.registry.push(data);
		return index;
	}
	/**
	 * Remove Promise from target key(s)
	 * @param id to use remove promise
	 */
	public removePromise(id: number) {
		this.registry.splice(id, 1);
	}
	/**
	 * Dispatch payload
	 * @param action payload
	 * @returns {Array<Promise<any>>} Array of Promises
	 */
	public dispatch(action: A): Promise<PT[]> {
		const pairs = this.getKeyPairs(action);
		const regs = this.findRegistryEntries(pairs);
		if (regs.length === 0) {
			return Promise.reject(new Error(`no promise found for keys: ${this.keys.join(', ')}`));
		}
		return Promise.all(regs.map((reg) => reg.promise(this.removeKeys(action))));
	}
	/**
	 * Check that we have all needed keys
	 * @param {object} data which should contain needed keys
	 */
	private getKeyPairs(data: A) {
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
	private removeKeys(data: A) {
		const payload = {...(data as object)};
		this.keys.forEach((k) => {
			delete payload[k];
		});
		return payload;
	}
	/**
	 * Find Promises from registry
	 * @param pairs keys to find Promises
	 */
	private findRegistryEntries(pairs: object): Array<A & IPromiseParam> {
		return this.registry.filter((r) => this.doWeHaveAllKeys(pairs, r));
	}
	/**
	 * Check if filter keys and registry entity keys match (and exists)
	 * @param pairs filter keys
	 * @param entry registry entry
	 */
	private doWeHaveAllKeys(pairs: object, entry: A & IPromiseParam): boolean {
		let ret = true;
		Object.keys(pairs).forEach((key) => {
			if (!(key in entry) || entry[key] !== pairs[key]) {
				ret = false;
			}
		});
		return ret;
	}
}
