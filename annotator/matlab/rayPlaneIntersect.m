function [p,t] = rayPlaneIntersect(ray_o, ray_d, plane )
%RAYPLANEINTERSECT finds the intersection of a ray (origin=ray_o,
% dir=ray_d) with a plane = (x,y,z,d), where (x,y,z) is the normal of the
% plane, and d is the distance from origin. Returns the 3D intersection
% position (p).
    t =  -(dot(plane(1:3),ray_o)+plane(4))/dot(plane(1:3),ray_d);
    p = ray_o+ray_d.*t;
end

