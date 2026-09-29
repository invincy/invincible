import{Component}from'react';

export class AppErrorBoundary extends Component{
 state={error:null};
 static getDerivedStateFromError(error){return{error}}
 componentDidCatch(error,info){console.error('Invincible UI crashed',error,info)}
 render(){
  if(!this.state.error)return this.props.children;
  return <div className="app-runtime-error" role="alert">
   <span>I</span>
   <h1>Invincible stopped loading</h1>
   <p>Your data is safe. Reload to try again; if this continues, the visible error below will help us fix it.</p>
   <code>{this.state.error?.message||'Unknown interface error'}</code>
   <button type="button" onClick={()=>location.reload()}>Reload Invincible</button>
  </div>;
 }
}
