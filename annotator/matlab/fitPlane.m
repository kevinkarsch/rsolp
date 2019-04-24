function plane = fitPlane(pts)
    plane = cross(pts(2,:)-pts(1,:), pts(3,:)-pts(1,:));
    plane = plane ./ norm(plane);
    plane(4) = -dot(pts(1,:),plane);
end