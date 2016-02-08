// require mama.vector3
(function (mod) {
    var vector3 = mod.vector3;
  
    //
    // constructor
    //
    function matrix4x4(initial_entries) {
        this.entries = initial_entries;   
    }

    //
    // class methods
    //
    matrix4x4.from_values = function (m0, m1, m2, m3, m4, m5, m6, m7, m8, m9, m10, m11, m12, m13, m14, m15) {
        return new matrix4x4([
            m0, m1, m2, m3,
            m4, m5, m6, m7,
            m8, m9, m10, m11,
            m12, m13, m14, m15
        ]);
    };

    // constructs matrix from values, arrays or values and arrays mixed, e.g.:
    // var m = mama.matrix4x4.construct(0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5);
    // var m = mama.matrix4x4.construct([0,1,2,3],[4,5,6,7],[8,9,0,1],[2,3,4,5]);
    // var m = mama.matrix4x4.construct([0,1,2,3,4,5,6,7,8,9,0,1,2,3,4,5]);
    matrix4x4.construct = function () {
        return new matrix4x4(Array.prototype.concat.apply([], arguments));
    }

    matrix4x4.identity = function () {
        return new matrix4x4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]);
    };

    matrix4x4.zero = function () {
        return new matrix4x4([
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0,
            0, 0, 0, 0
        ]);                
    };

    matrix4x4.copy = function (source_matrix) {
        return matrix4x4.construct(source_matrix.entries);
    };

    matrix4x4.rotation_x = function (angle) {
        var s = Math.sin(angle),
            c = Math.cos(angle);

        return new matrix4x4([
            1,  0, 0, 0,
            0,  c, s, 0,
            0, -s, c, 0,
            0,  0, 0, 1
        ]);
    };

    matrix4x4.rotation_y = function (angle) {
        var s = Math.sin(angle),
            c = Math.cos(angle);

        return new matrix4x4([
            c, 0, -s, 0,
            0, 1,  0, 0,
            s, 0,  c, 0,
            0, 0,  0, 1
        ]); 
    };

    matrix4x4.rotation_z = function (angle) {
        var s = Math.sin(angle),
            c = Math.cos(angle);

        return new matrix4x4([
             c, s, 0, 0,
            -s, c, 0, 0,
             0, 0, 1, 0,
             0, 0, 0, 1
        ]);   
    };

    matrix4x4.rotation_axis = function (axis, angle) {
        var s = Math.sin(-angle),
            c = Math.cos(-angle),
            c1 = 1 - c,
            xxc1 = axis.x * axis.x * c1,
            xyc1 = axis.x * axis.y * c1,
            xzc1 = axis.x * axis.z * c1,
            yyc1 = axis.y * axis.y * c1,
            yzc1 = axis.y * axis.z * c1,
            zzc1 = axis.z * axis.z * c1,
            zs = axis.z * s,
            ys = axis.y * s,
            xs = axis.x * s;

        axis.normalize();

        return new matrix4x4([
            xxc1 +  c, xyc1 - zs, xzc1 + ys, 0,
            xyc1 + zs, yyc1 +  c, yzc1 - xs, 0,
            xzc1 - ys, yzc1 + xs, zzc1 +  c, 0,
                    0,         0,         0, 1
        ]);    
    };

    matrix4x4.rotation_yaw_pitch_roll = function (yaw, pitch, roll) {
        return matrix4x4.rotation_z(roll)
                .multiply(matrix4x4.rotation_x(pitch))
                .multiply(matrix4x4.rotation_y(yaw));
    };

    matrix4x4.scaling = function (x, y, z) {
        return new matrix4x4([
            x, 0, 0, 0,
            0, y, 0, 0,
            0, 0, z, 0,
            0, 0, 0, 1
        ]); 
    };

    matrix4x4.translation = function (x, y, z) {
        return new matrix4x4([
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]); 
    };

    matrix4x4.look_at_lh = function (eye, target, up) {
        var z_axis = target.subtract(eye).normalize(),
            x_axis = vector3.cross(up, z_axis).normalize(),
            y_axis = vector3.cross(z_axis, x_axis).normalize(),
            ex = -vector3.dot(x_axis, eye),
            ey = -vector3.dot(y_axis, eye),
            ez = -vector3.dot(z_axis, eye);

        return new matrix4x4([
            x_axis.x, y_axis.x, z_axis.x, 0,
            x_axis.y, y_axis.y, z_axis.y, 0,
            x_axis.z, y_axis.z, z_axis.z, 0,
                  ex,       ey,       ez, 1
        ]); 
    }

    matrix4x4.perspective_lh = function (width, height, znear, zfar) {
        var znear2 = 2 * znear,
            diff = znear - zfar;

        return new matrix4x4([
            znear2 / width,               0,                     0, 0,
                         0, znear2 / height,                     0, 0,
                         0,               0,          -zfar / diff, 1,
                         0,               0, (znear * zfar) / diff, 0
        ]);
    };

    matrix4x4.perspective_fov_lh = function (fov, aspect, znear, zfar) {
        var tan = 1.0 / Math.tan(fov * 0.5),
            diff = znear - zfar;

        return new matrix4x4([
            tan / aspect,    0,                     0, 0,
                       0,  tan,                     0, 0,
                       0,    0,          -zfar / diff, 1,
                       0,    0, (znear * zfar) / diff, 0
        ]);
    };

    matrix4x4.transpose = function (matrix) {
        var m = matrix.entries;

        return new matrix4x4([
            m[0], m[4], m[8],  m[12],
            m[1], m[5], m[9],  m[13],
            m[2], m[6], m[10], m[14],
            m[3], m[7], m[11], m[15]
        ]);   
    };

    //
    // instance methods
    //
    matrix4x4.prototype.is_identity = function () {
        if (this.entries[0] != 1.0 || this.entries[5] != 0
                || this.entries[10] != 1.0 || this.entries[15] != 0) {
            return false;
        }

        // 0 1 2 3
        // 4 5 6 7
        // 8 9 a b
        // c d e f 

        if (this.entries[1] != 0.0 || this.entries[2] != 0.0
                || this.entries[3] != 0.0 || this.entries[4] != 0.0
                || this.entries[6] != 0.0 || this.entries[7] != 0.0
                || this.entries[8] != 0.0 || this.entries[9] != 0.0
                || this.entries[11] != 0.0 || this.entries[12] != 0.0
                || this.entries[13] != 0.0 || this.entries[14] != 0.0) {
            return false;   
        }

        return true;
    };

    // http://www.euclideanspace.com/maths/algebra/matrix/functions/determinant/fourD/index.htm
    matrix4x4.prototype.determinant = function () {
        var m = this.entries;

        return (m[4*0+3]*m[4*1+2]*m[4*2+1]*m[4*3+0] - m[4*0+2]*m[4*1+3]*m[4*2+1]*m[4*3+0] - m[4*0+3]*m[4*1+1]*m[4*2+2]*m[4*3+0] + m[4*0+1]*m[4*1+3]*m[4*2+2]*m[4*3+0]+
    m[4*0+2]*m[4*1+1]*m[4*2+3]*m[4*3+0] - m[4*0+1]*m[4*1+2]*m[4*2+3]*m[4*3+0] - m[4*0+3]*m[4*1+2]*m[4*2+0]*m[4*3+1] + m[4*0+2]*m[4*1+3]*m[4*2+0]*m[4*3+1]+
    m[4*0+3]*m[4*1+0]*m[4*2+2]*m[4*3+1] - m[4*0+0]*m[4*1+3]*m[4*2+2]*m[4*3+1] - m[4*0+2]*m[4*1+0]*m[4*2+3]*m[4*3+1] + m[4*0+0]*m[4*1+2]*m[4*2+3]*m[4*3+1]+
    m[4*0+3]*m[4*1+1]*m[4*2+0]*m[4*3+2] - m[4*0+1]*m[4*1+3]*m[4*2+0]*m[4*3+2] - m[4*0+3]*m[4*1+0]*m[4*2+1]*m[4*3+2] + m[4*0+0]*m[4*1+3]*m[4*2+1]*m[4*3+2]+
    m[4*0+1]*m[4*1+0]*m[4*2+3]*m[4*3+2] - m[4*0+0]*m[4*1+1]*m[4*2+3]*m[4*3+2] - m[4*0+2]*m[4*1+1]*m[4*2+0]*m[4*3+3] + m[4*0+1]*m[4*1+2]*m[4*2+0]*m[4*3+3]+
    m[4*0+2]*m[4*1+0]*m[4*2+1]*m[4*3+3] - m[4*0+0]*m[4*1+2]*m[4*2+1]*m[4*3+3] - m[4*0+1]*m[4*1+0]*m[4*2+2]*m[4*3+3] + m[4*0+0]*m[4*1+1]*m[4*2+2]*m[4*3+3]);
    };

    matrix4x4.prototype.to_array = function () {
        return this.entries;   
    };

    matrix4x4.prototype.invert = function () {
        var m = this.entries;

        return new matrix4x4([
            m[5]*m[10]*m[15] - m[5]*m[14]*m[11] - m[6]*m[9]*m[15] + m[6]*m[13]*m[11] + m[7]*m[9]*m[14] - m[7]*m[13]*m[10],
            -m[1]*m[10]*m[15] + m[1]*m[14]*m[11] + m[2]*m[9]*m[15] - m[2]*m[13]*m[11] - m[3]*m[9]*m[14] + m[3]*m[13]*m[10],
            m[1]*m[6]*m[15] - m[1]*m[14]*m[7] - m[2]*m[5]*m[15] + m[2]*m[13]*m[7] + m[3]*m[5]*m[14] - m[3]*m[13]*m[6],
            -m[1]*m[6]*m[11] + m[1]*m[10]*m[7] + m[2]*m[5]*m[11] - m[2]*m[9]*m[7] - m[3]*m[5]*m[10] + m[3]*m[9]*m[6],

            -m[4]*m[10]*m[15] + m[4]*m[14]*m[11] + m[6]*m[8]*m[15] - m[6]*m[12]*m[11] - m[7]*m[8]*m[14] + m[7]*m[12]*m[10],
            m[0]*m[10]*m[15] - m[0]*m[14]*m[11] - m[2]*m[8]*m[15] + m[2]*m[12]*m[11] + m[3]*m[8]*m[14] - m[3]*m[12]*m[10],
            -m[0]*m[6]*m[15] + m[0]*m[14]*m[7] + m[2]*m[4]*m[15] - m[2]*m[12]*m[7] - m[3]*m[4]*m[14] + m[3]*m[12]*m[6],
            m[0]*m[6]*m[11] - m[0]*m[10]*m[7] - m[2]*m[4]*m[11] + m[2]*m[8]*m[7] + m[3]*m[4]*m[10] - m[3]*m[8]*m[6],

            m[4]*m[9]*m[15] - m[4]*m[13]*m[11] - m[5]*m[8]*m[15] + m[5]*m[12]*m[11] + m[7]*m[8]*m[13] - m[7]*m[12]*m[9],
            -m[0]*m[9]*m[15] + m[0]*m[13]*m[11] + m[1]*m[8]*m[15] - m[1]*m[12]*m[11] - m[3]*m[8]*m[13] + m[3]*m[12]*m[9],
            m[0]*m[5]*m[15] - m[0]*m[13]*m[7] - m[1]*m[4]*m[15] + m[1]*m[12]*m[7] + m[3]*m[4]*m[13] - m[3]*m[12]*m[5],
            -m[0]*m[5]*m[11] + m[0]*m[9]*m[7] + m[1]*m[4]*m[11] - m[1]*m[8]*m[7] - m[3]*m[4]*m[9] + m[3]*m[8]*m[5],

            -m[4]*m[9]*m[14] + m[4]*m[13]*m[10] + m[5]*m[8]*m[14] - m[5]*m[12]*m[10] - m[6]*m[8]*m[13] + m[6]*m[12]*m[9],
            m[0]*m[9]*m[14] - m[0]*m[13]*m[10] - m[1]*m[8]*m[14] + m[1]*m[12]*m[10] + m[2]*m[8]*m[13] - m[2]*m[12]*m[9],
            -m[0]*m[5]*m[14] + m[0]*m[13]*m[6] + m[1]*m[4]*m[14] - m[1]*m[12]*m[6] - m[2]*m[4]*m[13] + m[2]*m[12]*m[5],
            m[0]*m[5]*m[10] - m[0]*m[9]*m[6] - m[1]*m[4]*m[10] + m[1]*m[8]*m[6] + m[2]*m[4]*m[9] - m[2]*m[8]*m[5]
        ]);
    };

    matrix4x4.prototype.multiply = function (other_matrix) {
        var m = this.entries,
            n = other_matrix.entries;

        // 0 1 2 3
        // 4 5 6 7
        // 8 9 a b
        // c d e f

        return new matrix4x4([
            m[0] * n[0] + m[1] * n[4] + m[2] * n[8] +  m[3] * n[12],
            m[0] * n[1] + m[1] * n[5] + m[2] * n[9] +  m[3] * n[13],
            m[0] * n[2] + m[1] * n[6] + m[2] * n[10] + m[3] * n[14],
            m[0] * n[3] + m[1] * n[7] + m[2] * n[11] + m[3] * n[15],

            m[4] * n[0] + m[5] * n[4] + m[6] * n[8] +  m[7] * n[12],
            m[4] * n[1] + m[5] * n[5] + m[6] * n[9] +  m[7] * n[13],
            m[4] * n[2] + m[5] * n[6] + m[6] * n[10] + m[7] * n[14],
            m[4] * n[3] + m[5] * n[7] + m[6] * n[11] + m[7] * n[15],

            m[8] * n[0] + m[9] * n[4] + m[10] * n[8] +  m[11] * n[12],
            m[8] * n[1] + m[9] * n[5] + m[10] * n[9] +  m[11] * n[13],
            m[8] * n[2] + m[9] * n[6] + m[10] * n[10] + m[11] * n[14],
            m[8] * n[3] + m[9] * n[7] + m[10] * n[11] + m[11] * n[15],

            m[12] * n[0] + m[13] * n[4] + m[14] * n[8] +  m[15] * n[12],
            m[12] * n[1] + m[13] * n[5] + m[14] * n[9] +  m[15] * n[13],
            m[12] * n[2] + m[13] * n[6] + m[14] * n[10] + m[15] * n[14],
            m[12] * n[3] + m[13] * n[7] + m[14] * n[11] + m[15] * n[15]
        ]);
    };

    matrix4x4.prototype.equals = function (other_matrix) {
        retu8rn (this.entries[0] === other_matrix.entries[0]
                    && this.entries[1] === other_matrix.entries[1]
                    && this.entries[2] === other_matrix.entries[2]
                    && this.entries[3] === other_matrix.entries[3]
                    && this.entries[4] === other_matrix.entries[4]
                    && this.entries[5] === other_matrix.entries[5]
                    && this.entries[6] === other_matrix.entries[6]
                    && this.entries[7] === other_matrix.entries[7]
                    && this.entries[8] === other_matrix.entries[8]
                    && this.entries[9] === other_matrix.entries[9]
                    && this.entries[10] === other_matrix.entries[10]
                    && this.entries[11] === other_matrix.entries[11]
                    && this.entries[12] === other_matrix.entries[12]
                    && this.entries[13] === other_matrix.entries[13]
                    && this.entries[14] === other_matrix.entries[14]
                    && this.entries[15] === other_matrix.entries[15]);  
    };

    matrix4x4.prototype.to_string = function () {
        return "matrix4x4 { mat: [\n\t"
                    + this.entries[0] + ", "
                    + this.entries[1] + ", "
                    + this.entries[2] + ", "
                    + this.entries[3] + ", \n\t"

                    + this.entries[4] + ", "
                    + this.entries[5] + ", "
                    + this.entries[6] + ", "
                    + this.entries[7] + ", \n\t"

                    + this.entries[8] + ", "
                    + this.entries[9] + ", "
                    + this.entries[10] + ", "
                    + this.entries[11] + ", \n\t"

                    + this.entries[12] + ", "
                    + this.entries[13] + ", "
                    + this.entries[14] + ", "
                    + this.entries[15] + ", \n"
                    + "] }";
    };

    matrix4x4.prototype.toString = matrix4x4.prototype.to_string;

    //module.exports = matrix4x4;
    mod.matrix4x4 = matrix4x4;
}(mod || (mod = {})));