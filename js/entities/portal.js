class Portal{
  constructor(x,y){
    this.x=x;
    this.y=y;
    this.r=42;
    this.angle=0;
  }

  update(){
    this.angle+=0.05;
  }

  draw(active){
    const sx=this.x-cam.x;
    const w=92;
    const h=112;
    const pulse=active?1+Math.sin(this.angle*2.2)*0.025:1;

    ctx.save();
    ctx.translate(sx,this.y-8);
    ctx.globalAlpha=active?1:0.46;

    if(portalImage.complete&&portalImage.naturalWidth>0){
      ctx.save();
      ctx.scale(pulse,pulse);
      ctx.drawImage(portalImage,-w/2,-h/2,w,h);
      ctx.restore();
    }

    ctx.globalAlpha=1;
    ctx.fillStyle=active?'#d8ccff':'#777';
    ctx.font='11px monospace';
    ctx.textAlign='center';
    ctx.fillText(active?'ENTER':'LOCKED',0,h/2+12);
    ctx.restore();
  }
}
