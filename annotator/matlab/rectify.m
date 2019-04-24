function [faces, mask] = rectify( I, pts2d, pts3d )
%RECTIFY Rectifies I based on pts (8x2), (8x3) and returns 6 faces (back
%face, i.e. the 6th face, is always blank)
    s = 512;
    w = abs(pts3d(1,1)-pts3d(4,1));
    h = abs(pts3d(1,2)-pts3d(2,2));
    d = abs(pts3d(1,3)-pts3d(5,3));
    h = s*h/w;
    d = s*d/w;
    w = s;
    
    faces = cell(6,1);
    mask = cell(6,1);
    pts = pts2d;
    M = ones(size(I,1),size(I,2));
    
    % Middle
    from = pts([1,2,3,4],:);
    to = [1 h; 1 1; w 1; w h];
    faces{1} = imtransform(I, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 w], 'YData', [1 h]);
    mask{1} = imtransform(M, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 w], 'YData', [1 h]);
    
    % Left
    from = pts([5,6,2,1],:);
    to = [1 h; 1 1; d 1; d h];
    faces{2} = imtransform(I, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 d], 'YData', [1 h]);
    mask{2} = imtransform(M, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 d], 'YData', [1 h]);
    
    % Ceiling
    from = pts([2,6,7,3],:);
    to = [1 d; 1 1; w 1; w d];
    faces{3} = imtransform(I, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 w], 'YData', [1 d]);
    mask{3} = imtransform(M, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 w], 'YData', [1 d]);
    
    % Right
    from = pts([4,3,7,8],:);
    to = [1 h; 1 1; d 1; d h];
    faces{4} = imtransform(I, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 d], 'YData', [1 h]);
    mask{4} = imtransform(M, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 d], 'YData', [1 h]);
    
    % Floor
    from = pts([5,1,4,8],:);
    to = [1 d; 1 1; w 1; w d];
    faces{5} = imtransform(I, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 w], 'YData', [1 d]);
    mask{5} = imtransform(M, maketform('projective', from, to), ...
        'udata', [1 size(I,2)], 'vdata', [1, size(I,1)], ...
        'XData', [1 w], 'YData', [1 d]);
    
    %Back
    faces{6} = zeros(size(faces{1}));
    mask{6} = zeros(size(mask{1}));
    for i=1:6
        mask{i} = mask{i}>0;
    end
end
