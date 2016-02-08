//
// constructor
//
function intersection(depth, ray, object) {
    // IMPLEMENT
    implement();
}

//
// class methods
//
////

//
// instance methods
//
intersection.prototype.to_string = function () {
    return "intersection { depth: " + this.depth
                + ", ray: " + this.ray
                + ", object: " + this.object
                + " }"
};

intersection.prototype.toString = intersection.prototype.to_string;

// get_pos
// add_object
// closer_intersection
