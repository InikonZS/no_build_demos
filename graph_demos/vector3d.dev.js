class Vector3d{
  constructor(x, y, z){
    this.x = x;
    this.y = y;
    this.z = z;
  }

  sub(x, y, z, self){
    if (self){
      this.x -= x;  
      this.y -= y; 
      this.z -= z; 
      return this;
    }
    return new Vector3d(this.x-x, this.y-y, this.z-z);
  }

  subVector(v, self){
    if (self){
      this.x -= v.x;  
      this.y -= v.y; 
      this.z -= v.z; 
      return this;
    }
    return new Vector3d(this.x-v.x, this.y-v.y, this.z-v.z);  
  }

  add(x, y, z, self){
    if (self){
      this.x += x;  
      this.y += y; 
      this.z += z; 
      return this;
    }
    return new Vector3d(this.x+x, this.y+y, this.z+z);
  }

  addVector(v, self){
    if (self){
      this.x += v.x;  
      this.y += v.y; 
      this.z += v.z; 
      return this;
    }
    return new Vector3d(this.x+v.x, this.y+v.y, this.z+v.z); 
  }

  mul(c, self){
    if (self){
      this.x *= c;  
      this.y *= c; 
      this.z *= c; 
      return this;
    }
    return new Vector3d(this.x*c, this.y*c, this.z*c);
  }

  isPositive(){
    return (this.x>0)&&(this.y>0)&&(this.z>0);
  }

  abs(){
    return Math.hypot(this.x, this.y, this.z);
  }

  abq(){
    return this.x*this.x +this.y*this.y + this.z*this.z;
  }

  normalize(){
    let len = this.abs();
    if (len!=0){
      return new Vector3d(this.x/len, this.y/len, this.z/len);
    } else {
      return new Vector3d(0,0,0);  
    }
  }

  toVec4(){
    return [this.x, this.y, this.z, 1];
  }

  fromList(list, ind){
    return new Vector3d(list[ind], list[ind+1], list[ind+2]);  
  }

  pushToList(list){
    list.push(this.x);
    list.push(this.y);
    list.push(this.z);
  }

  transform(matrix){
    let vec = m4.transformVector(matrix, this.toVec4());
    return new Vector3d(vec[0], vec[1], vec[2]);
  }

  dot(v){
    let u = this;
    return u.x*v.x + u.y*v.y + u.z*v.z;
  }
}

//module.exports = Vector3d;