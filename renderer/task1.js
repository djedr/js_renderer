console.log('*');
console.log('* 1.');
console.log('*');
console.log('vector class:');
console.log(mama.vector3);
console.log();
console.log('ray class:');
console.log(mama.ray);
console.log();
console.log('sphere class:');
console.log(mama.sphere);
console.log();
console.log('plane class:');
console.log(mama.plane);
console.log();

console.log('*');
console.log('* 2.');
console.log('*');
var sphere_center = new mama.vector3(0, 0, 0);
var sphere = new mama.sphere(sphere_center, 10);
console.log('S = ' + sphere);


console.log('*');
console.log('* 3.');
console.log('*');
var ray_origin = new mama.vector3(0, 0, -20);
var r1 = new mama.ray(ray_origin, sphere_center.subtract(ray_origin));
console.log('R1 = ' + r1);

console.log('*');
console.log('* 4.');
console.log('*');
var r2 = new mama.ray(ray_origin, new mama.vector3(0, 20, -20).subtract(ray_origin));
console.log('R2 = ' + r2);

console.log('*');
console.log('* 5.');
console.log('*');
r1.distance = sphere.intersect(r1); 
r2.distance = sphere.intersect(r2);
console.log('R1-S intersection:');
console.log(r1.distance ? r1.hit_point().to_string() : 'no intersection');
console.log('R2-S intersection:');
console.log(r2.distance ? r2.hit_point().to_string() : 'no intersection');

console.log('*');
console.log('* 6.');
console.log('*');
var r3_origin = new mama.vector3(10, 10, 0);
var r3 = new mama.ray(r3_origin, new mama.vector3(0, -1, 0));
console.log('R3 = ' + r3);

r3.distance = sphere.intersect(r3);
console.log('R3-S intersection:');
console.log(r3.distance ? r3.hit_point().to_string() : 'no intersection');

console.log('*');
console.log('* 7.');
console.log('*');
var plane = new mama.plane(new mama.vector3.zero(), new mama.vector3(0, 1, 1));
console.log('P = ' + plane);

console.log('*');
console.log('* 8.');
console.log('*');
r2.distance = plane.intersect(r2);
console.log('R2-P intersection:');
console.log(r2.distance ? r2.hit_point().to_string() : 'no intersection');