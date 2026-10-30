import {lazy,Suspense,useRef} from 'react';
import type {SceneMode,SceneState} from './EngineeringScene';
const EngineeringScene=lazy(()=>import('./EngineeringScene'));
export function Scene({mode,state,className=''}:{mode:SceneMode;state?:React.RefObject<SceneState>;className?:string}){const local=useRef<SceneState>({progress:0,focus:0,manual:null,paused:false});return <Suspense fallback={<div className="scene-loading"><span/>Preparing the engineering view</div>}><EngineeringScene mode={mode} state={state??local} className={className}/></Suspense>}
