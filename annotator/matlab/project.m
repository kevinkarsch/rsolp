function x = project(X, K, R)
    %Projects 3d points X (kx3) onto the image plane. Returns x (kx2)
    x = (K*R*X')';
    x = x(:,1:2)./repmat(x(:,3),[1,2]);
end