# dispatcher
Typescript based Dispatcher

## Javascript example with two keys
```javascript
// new dispatcher with specific keys
const disp = new Dispatcher(['_act', '_target']);
// register promise to keys
disp.addAction({_target: 'weather', _act: 'update'}, (weatherData) => {
	console.log('weatherData', weatherData);
	return Promise.resolve();
});
// dispatch some message
const msg = {_target: 'weather', _act: 'update', location: 'some city', temp: 10};
Promise.all(disp.dispatch(msg))
	.then( () => {
		console.log('dispatch done');
	})
	.catch( (err) => {
		console.log('Dispatch error', err);
	});
```

## Typescript example with two keys
```typescript
interface IKeys {
	_act: string;
	_target: string;
}

interface IData {
	location: string;
	temp: number;
}
// new dispatcher with specific keys
const disp = new Dispatcher<IKeys, Promise<void>>(['_act', '_target']);
// register promise to keys
const dispKey: IKeys = {_target: 'weather', _act: 'update'};
disp.addAction<IData>(dispKey, (data) => {
	console.log('weatherData', data.location, data.temp);
	return Promise.resolve();
});
// dispatch some message
const msg: IData & IKeys = {_target: 'weather', _act: 'update', location: 'some city', temp: 10};
Promise.all(disp.dispatch(msg))
	.then( () => {
		console.log('dispatch done');
	})
	.catch( (err) => {
		console.log('Dispatch error', err);
	});
```

## Typescript example with Keys/Action/Promise functions and two keys
```typescript
interface IKeys {
	_act: string;
	_target: string;
}

interface IData {
	location: string;
	temp: number;
}

// construct key for dispatch
const weatherMessageKeys = ():IKeys => {
	return {_target: 'weather', _act: 'update'};
}
// construct action with message data
const weatherMessageAction = (location: string, temp: number): IData & IKeys => {
	return {_target: 'weather', _act: 'update', location, temp}
}
// construct dispatch Promise to handle payload (and resolve Promise)
const weatherMessageDispatchPromise = (data: IData) => {
	console.log('weatherData', data.location, data.temp);
	return Promise.resolve();
}

// new dispatcher with specific keys
const disp = new Dispatcher<IKeys, Promise<void>>(['_act', '_target']);
// register promise to keys
disp.addAction<IData>( weatherMessageKeys(), weatherMessageDispatchPromise);
// dispatch some promise messages
Promise.all(disp.dispatch( weatherMessageAction('some city', 10) ))
	.then( () => {
		console.log('dispatch done');
	})
	.catch( (err) => {
		console.log('Dispatch error', err);
	});
```
