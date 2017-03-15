function e() {
    var e =  this;
    e._fov = 20,
        e.camera = new THREE.PerspectiveCamera(e._fov, window.innerWidth / window.innerHeight, 100, 2e6),
        e.theta = 0,
        e.phi = 0,
        e.radius = 0,
        e.target = new s.Vector3(0, 0, 0),
        e.orbitalCamera = new t(e.camera, e.radius, e.theta, e.phi, e.target),
        e.defaultTiltMultiplier = {
            theta: 5,
            phi: 5
        },
        e.tiltMultiplier = {
            theta: e.defaultTiltMultiplier.theta,
            phi: e.defaultTiltMultiplier.phi
        },
        e.easedTilt = {
            theta: 0,
            phi: 0
        },
        e.tiltDrag = {
            theta: 0,
            phi: 0
        },
        e.friction = .1,
        e.tiltFactor = {
            theta: 0,
            phi: 0
        },
        e.mouseMoveBind = e.mouseMoveHandler.bind(e),
        e.deviceMotionBind = e.deviceMotionHandler.bind(e);
    var i = new s.SphereBufferGeometry(20),
        r = new s.MeshBasicMaterial({
            color: 11141120
        });
    return e.targetMesh = new s.Mesh(i, r),
        e.timeline = new TimelineMax({
            paused: !0
        }),
        e.timeline.addPause(1),
        e
}

    e.prototype.isTouch = function() {
        return "ontouchend" in window
    },
    e.prototype.setResourceBundle = function(e) {
        t.prototype.setResourceBundle.call(this, e)
    },
    e.prototype.update = function(e, i) {
        t.prototype.update.call(this, e, i),
            this.targetMesh.position.copy(this.target),
            this.easedTilt.theta += (this.tiltDrag.theta + this.tiltFactor.theta - this.easedTilt.theta) * this.friction,
            this.easedTilt.phi += (this.tiltDrag.phi + this.tiltFactor.phi - this.easedTilt.phi) * this.friction;
        var r = this.theta + this.easedTilt.theta * this.tiltMultiplier.theta;
        r = Math.max(r, -89.99),
            r = Math.min(r, 89.99),
            this.orbitalCamera.theta = r,
            this.orbitalCamera.phi = this.phi + this.easedTilt.phi * this.tiltMultiplier.phi,
            this.orbitalCamera.radius = this.radius,
            this.orbitalCamera.update()
    },
    e.prototype.resize = function(e) {
        t.prototype.resize.call(this, e),
            this.camera.aspect = e.width / e.height,
            this.camera.updateProjectionMatrix()
    },
    e.prototype.start = function() {
        this.initialAccelerationIncludingGravity = {
                x: 0,
                y: 0
            },
            window.addEventListener("devicemotion", this.deviceMotionBind),
            this.isTouch() || document.body.addEventListener("mousemove", this.mouseMoveBind)
    },
    e.prototype.stop = function() {
        window.removeEventListener("devicemotion", this.deviceMotionBind),
            this.isTouch() || document.body.removeEventListener("mousemove", this.mouseMoveBind)
    },
    e.prototype.deviceMotionHandler = function(t) {
        var e = this.getDeviceMotionDifference(t);
        0 == e.x || 0 == e.y || isNaN(e.x) || isNaN(e.y) || this.mouseMoveBind && (document.body.removeEventListener("mousemove", this.mouseMoveBind),
            this.mouseMoveBind = null);
        var i = Math.round(1e4 * e.y) / 1e4,
            r = Math.round(1e4 * e.x) / 1e4,
            n = 5;
        i < -n && (i = -n),
            i > n && (i = n),
            r < -n && (r = -n),
            r > n && (r = n),
            this.tiltFactor.theta = i / n * -1,
            this.tiltFactor.phi = r / n * -1
    },
    e.prototype.mouseMoveHandler = function(t) {
        var e = t;
        this.isTouch() && (e = t.touches[0]);
        var i = new s.Vector2(e.pageX, e.pageY - window.pageYOffset),
            r = this.rect.width / 2,
            n = this.rect.height / 2,
            a = (i.y - n) / n,
            o = (i.x - r) / n;
        o > 0 && (o = Math.min(o, 1)),
            o < 0 && (o = Math.max(o, -1)),
            this.tiltFactor.theta = -a,
            this.tiltFactor.phi = -o
    },
    e.prototype.getDeviceMotionDifference = function(t) {
        var e = o.dimensions(),
            i = e.width,
            r = e.height,
            n = "landscape",
            s = "up",
            a = 0,
            l = 0;
        r > i && (n = "portrait"),
            "portrait" == n && (t.accelerationIncludingGravity.y > 0 && (s = "down"),
                a = t.accelerationIncludingGravity.x,
                l = t.accelerationIncludingGravity.z),
            "landscape" == n && (t.accelerationIncludingGravity.x > 0 && (s = "down"),
                a = t.accelerationIncludingGravity.y,
                l = t.accelerationIncludingGravity.z),
            n == this.deviceOrientation && s == this.deviceDirection || (this.deviceOrientation = n,
                this.deviceDirection = s,
                this.initialAccelerationIncludingGravity = {
                    x: a,
                    y: l
                });
        var h = {
            x: a - this.initialAccelerationIncludingGravity.x,
            y: l - this.initialAccelerationIncludingGravity.y
        };
        return h
    },
    e.prototype.copy = function(t) {
        this.radius = t.radius,
            this.theta = t.theta,
            this.phi = t.phi
    },
    e.prototype.getFOV = function(t) {
        return this._fov
    },
    e.prototype.setFOV = function(t) {
        this._fov = t,
            this.camera.fov = t,
            this.camera.updateProjectionMatrix()
    }

function t(t, e, i, n, s) {
    this.camera = t,
        this.radius = isNaN(e) ? 1.5 : e,
        this.theta = isNaN(i) ? 0 : i,
        this.phi = isNaN(n) ? 0 : n,
        this.target = s || new r.Vector3(0, 0, 0)
}
t.prototype.update = function() {
        var t = this.theta * Math.PI / 180,
            e = this.phi * Math.PI / 180,
            i = this.getRadiusPoint(this.radius, t, e);
        this.camera.position.x = i.x + this.target.x,
            this.camera.position.y = i.y + this.target.y,
            this.camera.position.z = i.z + this.target.z,
            this.camera.lookAt(this.target)
    },
    t.prototype.getRadiusPoint = function(t, e, i) {
        var n = t * Math.cos(e),
            s = t * Math.sin(e),
            a = n * Math.cos(i),
            o = n * Math.sin(i);
        return new r.Vector3(a, s, o)
    }
