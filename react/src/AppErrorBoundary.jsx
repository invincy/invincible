import{APP_ICON_URL}from'../../shared/branding';
import{Component}from'react';

export class AppErrorBoundary extends Component{
 state={error:null,componentStack:''};
 static getDerivedStateFromError(error){return{error}}
 componentDidCatch(error,info){console.error('Invincible UI crashed',error,info);this.setState({componentStack:info?.componentStack||''})}
 render(){
  if(!this.state.error)return this.props.children;
  return <div className="app-runtime-error" role="alert">
   <img className="runtime-brand-mark" src={APP_ICON_URL} alt="" width="64" height="64"/>
   <h1>Invincible stopped loading</h1>
   <p>Your data is safe. Reload to try again; if this continues, the visible error below will help us fix it.</p>
   <code>{this.state.error?.message||'Unknown interface error'}{this.state.componentStack&&`\n${this.state.componentStack}`}</code>
   <button type="button" onClick={()=>location.reload()}>Reload Invincible</button>
  </div>;
 }
}
