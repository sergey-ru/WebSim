// DVSL Network Chart library. Version 1.01
// (c) 2013 - 2013 Data Visualization Software Lab
//
// http://datavisualizationsoftwarelab.com http://dvsl.co

(function() {
    var v = {Bar: {}};
    var o = {};
    var g;
    g = (function() {
        Z.prototype.scene = null;
        Z.prototype.events = null;
        Z.prototype.currentObject = null;
        function Z(aa) {
            this.chart = aa;
            this.scene = aa.scene;
            this.events = aa.events;
            this.navigator = aa.navigator;
            this.dragPointers = {}
        }
        Z.prototype.onPointerMove = function(aa) {
            var ab;
            if (!this.scene.xyInChart(aa.x, aa.y)) {
                return
            }
            ab = this.scene.findLinkOrNodeAt(aa.x, aa.y, this.scene.settings.interaction.selection.tolerance);
            return this.switchCurrentObject(ab, aa)
        };
        Z.prototype.onPointerOut = function(aa) {
            return this.switchCurrentObject(null, aa)
        };
        Z.prototype.onPointerDown = function(aa) {
            var ab;
            if (!this.scene.xyInChart(aa.x, aa.y)) {
                return
            }
            ab = this.scene.findLinkOrNodeAt(aa.x, aa.y, this.scene.settings.interaction.selection.tolerance);
            this.switchCurrentObject(ab, aa);
            if (ab instanceof N) {
                this.updateSelection(aa, ab, true);
                this.setPointerNode(aa, ab);
                return aa.consumed = true
            }
        };
        Z.prototype.onPointerUp = function(aa) {
            if (this.dragPointers[aa.identifier]) {
                this.setPointerNode(aa, null);
                return aa.consumed = true
            }
        };
        Z.prototype.onPointerDrag = function(aa) {
            var ae, ad, ac, ab;
            ac = this.dragPointers[aa.identifier];
            if (!ac) {
                return
            }
            ab = this.scene.fromDisplay(aa.x, aa.y), ae = ab[0], ad = ab[1];
            ac.mouseX = aa.x;
            ac.mouseY = aa.y;
            this.dragNodes(ac, ae, ad, this.scene.settings.interaction.selection.lockNodesOnMove);
            return aa.consumed = true
        };
        Z.prototype.onClick = function(aa) {
            var ab, ac;
            if (!this.scene.xyInChart(aa.x, aa.y)) {
                return
            }
            ac = this.scene.findLinkOrNodeAt(aa.x, aa.y, this.scene.settings.interaction.selection.tolerance);
            this.updateSelection(aa, ac, false);
            if (ac instanceof N) {
                aa.clickNode = ac
            } else {
                aa.clickLink = ac
            }
            ab = this.chart.notifyClick(aa);
            if (ab.defaultPrevented) {
                return aa.consumed = true
            }
        };
        Z.prototype.onRightClick = function(aa) {
            var ab, ac;
            if (!this.scene.xyInChart(aa.x, aa.y)) {
                return
            }
            ac = this.scene.findLinkOrNodeAt(aa.x, aa.y, this.scene.settings.interaction.selection.tolerance);
            this.updateSelection(aa, ac, false);
            if (ac instanceof N) {
                aa.clickNode = ac
            } else {
                aa.clickLink = ac
            }
            ab = this.chart.notifyRightClick(aa);
            if (ab.defaultPrevented) {
                return aa.consumed = true
            }
        };
        Z.prototype.onDoubleClick = function(aa) {
            var ab, ac;
            ac = this.scene.findLinkOrNodeAt(aa.x, aa.y, this.scene.settings.interaction.selection.tolerance);
            if (ac instanceof N) {
                aa.clickNode = ac
            } else {
                aa.clickLink = ac
            }
            ab = this.chart.notifyDoubleClick(aa);
            if (ab.defaultPrevented) {
                return aa.consumed = true
            }
        };
        Z.prototype.doAnimations = function(ac) {
            var ah, ag, af, ae, ad, aa, ab;
            ad = this.dragPointers;
            ab = [];
            for (ah in ad) {
                ae = ad[ah];
                aa = this.scene.fromDisplay(ae.mouseX, ae.mouseY), ag = aa[0], af = aa[1];
                this.dragNodes(ae, ag, af, false);
                ab.push(ac.changes.coordinates = true)
            }
            return ab
        };
        Z.prototype.updateSelection = function(aa, ac, ab) {
            if (!this.scene.settings.interaction.selection.enabled) {
                return
            }
            if (!aa.shiftKey && (!ac || (!this.scene.settings.interaction.selection.nodesSelectable && ac.isNode) || (!this.scene.settings.interaction.selection.linksSelectable && ac.isLink))) {
                return this.chart.setSelection([])
            } else {
                if (ac && aa.shiftKey || (ab && Q.arrayContains(this.scene.selection, ac))) {
                    if (!Q.arrayContains(this.scene.selection, ac)) {
                        this.scene.selection.push(ac);
                        return this.chart.setSelection(this.scene.selection, true)
                    }
                } else {
                    if (ac) {
                        return this.chart.setSelection([ac])
                    }
                }
            }
        };
        Z.prototype.dragNodes = function(ab, aa, ai, ag) {
            var aj, ah, ac, ad, af, ae;
            aj = aa + ab.x - ab.node.x;
            ah = ai + ab.y - ab.node.y;
            if (this.scene.selection.length > 0) {
                ae = this.scene.selection;
                for (ad = 0, af = ae.length; ad < af; ad++) {
                    ac = ae[ad];
                    if (ac.isNode) {
                        ac.x += aj;
                        ac.y += ah;
                        if (ag) {
                            ac.userLock = true
                        }
                    }
                }
            } else {
                ab.node.x += aj;
                ab.node.y += ah;
                if (ag) {
                    ab.node.userLock = true
                }
            }
            return this.events.notifySceneChanges({coordinates: true})
        };
        Z.prototype.setPointerNode = function(ad, ac) {
            var ag, ab, aa, af, ae;
            ag = ad.identifier;
            ab = this.dragPointers[ag];
            if (ab) {
                ab.node.locks -= 1;
                delete this.dragPointers[ag]
            }
            if (ac) {
                ae = this.scene.fromDisplay(ad.x, ad.y), aa = ae[0], af = ae[1];
                this.dragPointers[ad.identifier] = {x: ac.x - aa, y: ac.y - af, node: ac, mouseX: ad.x, mouseY: ad.y};
                return ac.locks += 1
            }
        };
        Z.prototype.switchCurrentObject = function(ab, aa) {
            if (ab === this.currentSlice) {
                return
            }
            aa.changes.current = true;
            this.scene.setActiveObject(ab);
            if (this.currentSlice instanceof N) {
                this.currentSlice.locks -= 1
            }
            this.currentSlice = ab;
            if (this.currentSlice instanceof N) {
                this.currentSlice.locks += 1
            }
            if (this.currentSlice) {
                if (this.currentSlice.isNode) {
                    aa.hoverNode = this.currentSlice
                }
                if (this.currentSlice.isLink) {
                    aa.hoverLink = this.currentSlice
                }
            }
            return this.chart.notifyHoverChanged(aa)
        };
        return Z
    })();
    var k, i = this;
    k = (function() {
        Z.prototype.settings = null;
        Z.prototype.nodes = {};
        Z.prototype.links = {};
        Z.prototype.nodeToLinks = {};
        Z.prototype.pendingNodes = {};
        Z.prototype.requestedNodes = {};
        Z.prototype.requests = [];
        Z.prototype.requestScheduled = false;
        Z.prototype.cleanupScheduled = false;
        Z.prototype.dataFunc = null;
        function Z(aa) {
            var ab, ac = this;
            this.chart = aa;
            this.runRequests = function() {
                return Z.prototype.runRequests.apply(ac, arguments)
            };
            this.settings = aa.settings;
            this.nodes = {};
            this.links = {};
            this.nodeToLinks = {};
            this.pendingNodes = {};
            this.requestedNodes = {};
            this.dataFunc = this.getDataFunction();
            if (this.settings.data.randomNodes > 0) {
                ab = this.genRandomGraph(this.settings.data);
                this.updateGraph(ab)
            } else {
                if (this.settings.data.preloaded) {
                    this.updateGraph(this.settings.data.preloaded)
                }
            }
        }
        Z.otherEnd = function(aa, ab) {
            if (ab === aa.from) {
                return aa.to
            }
            if (ab === aa.to) {
                return aa.from
            }
            return null
        };
        Z.multiLinkId = function(aa) {
            if (aa.from < aa.to) {
                return aa.from + "#" + aa.to
            } else {
                return aa.to + "#" + aa.from
            }
        };
        Z.prototype.remove = function() {
        };
        Z.prototype.getQueueLength = function() {
            return Q.countProperties(this.pendingNodes) + Q.countProperties(this.requestedNodes)
        };
        Z.prototype.getNodeData = function(aa) {
            if (this.nodes.hasOwnProperty(aa)) {
                return this.nodes[aa]
            } else {
                if (this.dataFunc != null) {
                    this.requestNodeData(aa)
                }
            }
            return null
        };
        Z.prototype.nodeRemoved = function(aa) {
            delete this.pendingNodes[aa];
            return delete this.requestedNodes[aa]
        };
        Z.prototype.getLinkData = function(aa) {
            return this.links[aa]
        };
        Z.prototype.getNodeLinks = function(aa) {
            if (this.nodes.hasOwnProperty(aa) && this.nodes[aa].expanded) {
                return this.applyLinkFilter(aa)
            } else {
                if (this.dataFunc != null) {
                    this.requestNodeData(aa)
                }
            }
            return null
        };
        Z.prototype.getNodeCollectedLinks = function(aa) {
            return this.applyLinkFilter(aa)
        };
        Z.prototype.isExpanded = function(aa) {
            return this.nodes.hasOwnProperty(aa) && this.nodes[aa].expanded
        };
        Z.prototype.isFilteredNode = function(ac) {
            var ab, aa;
            aa = this.settings.filters.nodeFilter;
            ab = this.nodes[ac];
            if (!aa || !ab) {
                return false
            }
            return !aa(ab, this.isExpanded(ac) ? this.nodeToLinks[ac] : null)
        };
        Z.prototype.getNodes = function() {
            var ae, ac, ab, aa, ad;
            ab = this.settings.filters.nodeFilter;
            if (!ab) {
                return this.nodes
            }
            aa = {};
            ad = this.nodes;
            for (ae in ad) {
                ac = ad[ae];
                if (ab(ac, this.isExpanded(ae) ? this.nodeToLinks[ae] : null)) {
                    aa[ae] = ac
                }
            }
            return aa
        };
        Z.prototype.applyLinkFilter = function(aq) {
            var aC, aB, ao, au, av, an, ag, af, at, al, aw, ap, aa, ai, am, ak, aj, ar, ah, ae, ad, ac, ab, ay, aA, az, ax;
            aa = this.nodes[aq];
            af = this.nodeToLinks[aq];
            if (!(af && af.length > 0)) {
                return[]
            }
            ag = this.settings.filters.linkFilter;
            ai = this.settings.filters.nodeFilter;
            am = this.settings.filters.nodeLinksProcessor;
            aw = this.settings.filters.multilinkProcessor;
            if (ai && !ai(aa, aa.expanded ? af : null)) {
                return[]
            }
            if (ai || ag) {
                ao = [];
                for (ae = 0, ay = af.length; ae < ay; ae++) {
                    an = af[ae];
                    aj = Z.otherEnd(an, aq);
                    ak = this.nodes[aj];
                    if (ag) {
                        if (an.from === aq) {
                            aC = aa;
                            aB = ak
                        } else {
                            aC = ak;
                            aB = aa
                        }
                        if (!ag(an, aC, aB)) {
                            continue
                        }
                    }
                    if (ai && !ai(ak, ak.expanded ? this.nodeToLinks[aj] : null)) {
                        continue
                    }
                    ao.push(an)
                }
                af = ao
            }
            if (am) {
                af = am(aa, af)
            }
            if (aw) {
                ar = {};
                for (ad = 0, aA = af.length; ad < aA; ad++) {
                    an = af[ad];
                    ar[Z.otherEnd(an, aq)] = true
                }
                if (Q.countProperties(ar) < af.length) {
                    ao = [];
                    al = {};
                    ap = {};
                    for (ac = 0, az = af.length; ac < az; ac++) {
                        av = af[ac];
                        at = Z.multiLinkId(av);
                        if (al.hasOwnProperty(at)) {
                            if (!ap.hasOwnProperty(at)) {
                                ap[at] = [al[at], av]
                            } else {
                                ap[at].push(av)
                            }
                        } else {
                            al[at] = av
                        }
                    }
                    for (ab = 0, ax = af.length; ab < ax; ab++) {
                        av = af[ab];
                        at = Z.multiLinkId(av);
                        if (!ap.hasOwnProperty(at)) {
                            ao.push(av)
                        }
                    }
                    for (au in ap) {
                        af = ap[au];
                        av = af[0];
                        ah = aw(af, this.nodes[av.from], this.nodes[av.to]);
                        if (Q.isArray(ah)) {
                            ao.concat(ah)
                        } else {
                            if (ah) {
                                ao.push(ah)
                            }
                        }
                    }
                    af = ao
                }
            }
            return af
        };
        Z.prototype.getAllNodes = function(af) {
            var ae, ad, aa, ab, ac = this;
            if (!this.dataFunc) {
                aa = (function() {
                    var ah, ag;
                    ah = this.nodes;
                    ag = [];
                    for (ae in ah) {
                        ad = ah[ae];
                        ag.push(ae)
                    }
                    return ag
                }).call(this);
                return af(aa)
            } else {
                ab = function(ag) {
                    ac.dataArrived(null, ag);
                    aa = (function() {
                        var ai, ah;
                        ai = this.nodes;
                        ah = [];
                        for (ae in ai) {
                            ad = ai[ae];
                            ah.push(ae)
                        }
                        return ah
                    }).call(ac);
                    return af(aa)
                };
                return this.dataFunc(null, ab, this.dataError)
            }
        };
        Z.prototype.requestNodeData = function(aa) {
            if (this.pendingNodes.hasOwnProperty(aa) || this.requestedNodes.hasOwnProperty(aa)) {
                return
            }
            this.pendingNodes[aa] = true;
            if ((this.dataFunc != null) && !this.requestScheduled) {
                this.requestScheduled = true;
                return setTimeout(this.runRequests, 0)
            }
        };
        Z.prototype.runRequests = function() {
            var ae, am, an, ac, al, ag, ah, ai, aj, aq, ab, aa, ap, ar, ak, af, ad, ao = this;
            this.requestScheduled = false;
            ai = new Date().getTime();
            aj = this.settings.data.requestTimeout;
            if (this.cleanupScheduled) {
                this.cleanupScheduled = false;
                ag = [];
                ak = this.requests;
                for (ab = 0, ap = ak.length; ab < ap; ab++) {
                    al = ak[ab];
                    if (al.time + aj > ai) {
                        ag.push(al)
                    } else {
                        af = al.nodes;
                        for (aa = 0, ar = af.length; aa < ar; aa++) {
                            am = af[aa];
                            if (this.requestedNodes[am]) {
                                delete this.requestedNodes[am];
                                this.pendingNodes[am] = true
                            }
                        }
                        if (al.time !== 0) {
                            this.chart.error("Data request timed out, timeout " + aj + " ms")
                        }
                    }
                }
                this.requests = ag
            }
            while (Q.hasProperties(this.pendingNodes) && this.requests.length < this.settings.data.numberOfParralelRequests) {
                an = [];
                ad = this.pendingNodes;
                for (am in ad) {
                    aq = ad[am];
                    an.push(am);
                    delete this.pendingNodes[am];
                    this.requestedNodes[am] = true;
                    if (an.length > this.settings.data.requestMaxUnits) {
                        break
                    }
                }
                this.chart.log("Requesting data on " + an);
                ah = {time: ai, nodes: an};
                ac = function(at) {
                    return ao.dataArrived(ah, at)
                };
                ae = function() {
                    return ao.dataError(ah)
                };
                this.dataFunc(an, ac, ae);
                this.requests.push(ah)
            }
            if (this.requests.length > 0 && !this.cleanupScheduled) {
                this.cleanupScheduled = true;
                return setTimeout(this.runRequests, aj)
            }
        };
        Z.prototype.dataError = function(aa) {
            this.chart.error("Data request failed for nodes: " + aa.nodes);
            aa.time = 0;
            this.cleanupScheduled = true;
            return this.runRequests()
        };
        Z.prototype.dataArrived = function(ak, ap) {
            var al, aC, av, au, aE, ar, ao, an, aq, at, ah, af, ad, ab, az, aB, aA, ay, ax, aw, aa, aD, am, aj, ai, ag, ae, ac;
            al = false;
            if (ap) {
                aC = Q.parseData(ap, this.settings.data.format, this.chart);
                if (aC.error != null) {
                    this.chart.error(aC.error)
                }
                al = true;
                am = ["links", "nodes"];
                for (ah = 0, az = am.length; ah < az; ah++) {
                    an = am[ah];
                    if (!aC.hasOwnProperty(an)) {
                        al = false;
                        this.chart.error("Field " + an + " not set in data")
                    }
                }
                if (!Q.isArray(aC.nodes)) {
                    ao = aC.nodes;
                    aC.nodes = [];
                    for (aE in ao) {
                        at = ao[aE];
                        at.id = aE;
                        aC.nodes.push(at)
                    }
                }
                if (!Q.isArray(aC.links)) {
                    ao = aC.links;
                    aC.links = [];
                    for (aE in ao) {
                        at = ao[aE];
                        at.id = aE;
                        aC.links.push(at)
                    }
                }
                if (ak) {
                    this.chart.log("Got " + aC.nodes.length + " data on  " + ak.nodes)
                } else {
                    this.chart.log("Got " + aC.nodes.length + " data on all nodes")
                }
                au = {};
                aj = aC.nodes;
                for (af = 0, aB = aj.length; af < aB; af++) {
                    ar = aj[af];
                    if (au.hasOwnProperty(ar.id)) {
                        this.chart.error("Data response: Multiple nodes with the same ID: " + ar.id)
                    }
                    au[ar.id] = true
                }
                au = {};
                ai = aC.links;
                for (ad = 0, aA = ai.length; ad < aA; ad++) {
                    ar = ai[ad];
                    if (au.hasOwnProperty(ar.id)) {
                        this.chart.error("Data response: Multiple links with the same ID: " + ar.id)
                    }
                    au[ar.id] = true
                }
            } else {
                this.chart.error("Got empty response")
            }
            av = {};
            if (al) {
                this.updateGraph(aC);
                ag = aC.nodes;
                for (ab = 0, ay = ag.length; ab < ay; ab++) {
                    ar = ag[ab];
                    if (ar.expanded) {
                        av[ar.id] = true;
                        delete this.pendingNodes[ar.id]
                    }
                    if (ar.error) {
                        delete this.pendingNodes[ar.id];
                        av[ar.id] = true
                    }
                }
                aq = {};
                ae = aC.nodes;
                for (aa = 0, ax = ae.length; aa < ax; aa++) {
                    ar = ae[aa];
                    aq[ar.id] = true
                }
                this.chart.events.notifySceneChanges({dataArrived: true, dataExpandedNodeIds: av, dataNodesIds: aq})
            }
            if (ak) {
                Q.removeFromArray(this.requests, ak);
                ac = ak.nodes;
                for (aD = 0, aw = ac.length; aD < aw; aD++) {
                    ar = ac[aD];
                    delete this.requestedNodes[ar]
                }
                return this.runRequests()
            }
        };
        Z.prototype.updateGraph = function(ag) {
            var ab, aj, af, ae, ai, aa, ah, ad, ac;
            ah = ag.nodes;
            for (af = 0, ai = ah.length; af < ai; af++) {
                ab = ah[af];
                if (this.nodes.hasOwnProperty(ab.id)) {
                    if (!ab.error && ab.expanded) {
                        delete this.nodes[ab.id]["_noData"];
                        Q.extend(this.nodes[ab.id], ab)
                    }
                } else {
                    this.nodes[ab.id] = ab;
                    this.nodeToLinks[ab.id] = []
                }
            }
            ad = ag.links;
            ac = [];
            for (ae = 0, aa = ad.length; ae < aa; ae++) {
                ab = ad[ae];
                if (this.links.hasOwnProperty(ab.id)) {
                    aj = this.links[ab.id];
                    if (aj.from !== ab.from || aj.to !== ab.to) {
                        ac.push(this.chart.error("Changing link from,to not supported"))
                    } else {
                        ac.push(Q.extend(this.links[ab.id], ab))
                    }
                } else {
                    if (!this.nodes.hasOwnProperty(ab.from)) {
                        this.nodes[ab.from] = {id: ab.from, _noData: true};
                        this.nodeToLinks[ab.from] = []
                    }
                    if (!this.nodes.hasOwnProperty(ab.to)) {
                        this.nodes[ab.to] = {id: ab.to, _noData: true};
                        this.nodeToLinks[ab.to] = []
                    }
                    this.links[ab.id] = ab;
                    this.nodeToLinks[ab.from].push(ab);
                    ac.push(this.nodeToLinks[ab.to].push(ab))
                }
            }
            return ac
        };
        Z.prototype.genRandomGraph = function(ad) {
            var ai, aj, ac, al, ab, ag, af, ak, aa, ah, ae;
            ab = ad.randomNodes;
            al = ad.randomLinks;
            if (ad.random === "grid") {
                ai = this.genRandomGrid(ab, ad.randomGridLinkProbability)
            } else {
                ai = this.genRandomUniform(ab, al)
            }
            ah = ai.nodes;
            for (ag = 0, ak = ah.length; ag < ak; ag++) {
                ac = ah[ag];
                ac.name = "Node " + ac.id;
                ac.value = 10 + Math.random() * 40
            }
            ae = ai.links;
            for (af = 0, aa = ae.length; af < aa; af++) {
                aj = ae[af];
                aj.name = "Link " + aj.id;
                aj.value = 1 + Math.random() * 5
            }
            return ai
        };
        Z.prototype.genRandomGrid = function(an, am) {
            var al, ar, ah, aq, ad, ao, ap, ak, ai, ae, ac, ab, aa, at, aj, ag, af;
            ap = [];
            ad = [];
            for (ar = ae = 0, aj = an - 1; 0 <= aj ? ae <= aj : ae >= aj; ar = 0 <= aj ? ++ae : --ae) {
                ao = {id: "n" + ar, expanded: true};
                ap.push(ao)
            }
            al = Math.ceil(Math.sqrt(an));
            for (ai = ac = 0, ag = al - 1; ac <= ag; ai = ac += 1) {
                for (ak = ab = 0, af = al - 1; ab <= af; ak = ab += 1) {
                    ah = ak + ai * al;
                    if (ah >= an) {
                        continue
                    }
                    if (ak > 0 && Math.random() <= am) {
                        ad.push({from: "n" + ah, to: "n" + (ah - 1)})
                    }
                    if (ai > 0 && Math.random() <= am) {
                        ad.push({from: "n" + ah, to: "n" + (ah - al)})
                    }
                }
            }
            for (ah = aa = 0, at = ad.length; aa < at; ah = ++aa) {
                aq = ad[ah];
                aq.id = "" + ah
            }
            return{nodes: ap, links: ad}
        };
        Z.prototype.genRandomUniform = function(ab, al) {
            var aj, ae, ak, ac, aa, ah, ag, ai, af, ad;
            aa = [];
            ak = [];
            for (aj = ah = 0, ai = ab - 1; 0 <= ai ? ah <= ai : ah >= ai; aj = 0 <= ai ? ++ah : --ah) {
                ac = {id: "n" + aj, expanded: true};
                if (aa.length > 0) {
                    ae = {id: "l" + aj, from: ac.id, to: aa[Math.random() * aa.length | 0].id};
                    ak.push(ae)
                }
                aa.push(ac)
            }
            for (aj = ag = af = ak.length, ad = al - 1; ag <= ad; aj = ag += 1) {
                ae = {id: "l" + (aj + 1), from: aa[Math.random() * aa.length | 0].id, to: aa[Math.random() * aa.length | 0].id};
                ak.push(ae)
            }
            return{nodes: aa, links: ak}
        };
        Z.prototype.getDataFunction = function() {
            var aa;
            aa = this.settings.data;
            if (aa.dataFunction) {
                return aa.dataFunction
            } else {
                if (aa.url) {
                    return function(ac, ae, ab) {
                        var ad;
                        ad = [];
                        if (ac != null) {
                            ad.push(["nodes", ac.toString()])
                        }
                        return Q.doRequest(aa.url, ad, ae, ab)
                    }
                } else {
                    return null
                }
            }
        };
        Z.prototype.isFilteredLink = function(ac) {
            var aa, ab;
            ab = this.settings.filters.linkFilter;
            aa = this.links[ac];
            if (!ab || !aa) {
                return false
            }
            return !ab(aa, this.nodes[aa.from], this.nodes[aa.to])
        };
        Z.prototype.dumpData = function(ac) {
            var aa, ag, am, aj, ab, ad, af, al, an, ae, ak, ao, ai, ah;
            ak = {};
            aj = {};
            al = 0;
            af = 0;
            an = {};
            ab = [];
            ag = [];
            ai = this.nodes;
            for (aa in ai) {
                ae = ai[aa];
                if (!this.isFilteredNode(aa)) {
                    ab.push(ae);
                    if (ac) {
                        ad = "" + al;
                        al += 1;
                        ak[ad] = aa;
                        ae.id = ad
                    }
                    an[aa] = true
                }
            }
            ah = this.links;
            for (aa in ah) {
                am = ah[aa];
                if (!this.isFilteredLink(aa) && an[am.from] && an[am.to]) {
                    ag.push(am);
                    if (ac) {
                        ad = "" + af;
                        af += 1;
                        aj[ad] = aa;
                        am.id = ad;
                        am.from = this.nodes[am.from].id;
                        am.to = this.nodes[am.to].id
                    }
                }
            }
            ao = JSON.stringify({nodes: ab, links: ag}, ["nodes", "links", "id", "from", "to", "type", "state", "expanded", "Employees", "position_title", "start", "end", "shares_perc", "terminated", "status", "finanses", "Turnover_prev", "Employees_prev"], "  ");
            for (ad in ak) {
                aa = ak[ad];
                this.nodes[aa].id = aa
            }
            for (ad in aj) {
                aa = aj[ad];
                ag = this.links[aa];
                ag.id = aa;
                ag.from = ak[ag.from];
                ag.to = ak[ag.to]
            }
            return ao
        };
//        Z.prototype.runMovingMessage = function(nodeId1, nodeId2) { // keren
//            if ((this.nodes[nodeId1] && this.nodes[nodeId1].initial) && (this.nodes[nodeId2] && this.nodes[nodeId2].initial)) {
//                var allLinks1 = this.nodeToLinks[nodeId1];
//                var allLinks2 = this.nodeToLinks[nodeId2];
//
//                if (!(allLinks1 && allLinks1.length > 0) && !(allLinks2 && allLinks2.length > 0)) {
//                    return;
//                }
//
//                var commonLink = null;
//                for (var i = 0; i < allLinks1.length; i++) {
//                    for (var j = 0; j < allLinks2.length; j++) {
//                        if (allLinks1[i].id == allLinks2[i].id) {
//                            commonLink = allLinks1[i];
//                        }
//                    }
//                }
//
//                var theCanvas = this.chart.scene.canvas;
//
//                theCanvas.beginPath();
//                theCanvas.arc(95, 50, 40, 0, 2 * Math.PI);
//                theCanvas.stroke();
//
//
//            } else {
//                //return this.addAction(nodeId1, {expanded: true})
//            }
//        };
        return Z
    })();
    var e;
    e = (function() {
        function Z(aa) {
            this.chart = aa;
            this.settings = this.chart.settings;
            this.scene = this.chart.scene;
            this.idToNode = {};
            this.idToLink = {};
            this.linksQueue = {};
            this.nodeQueue = {};
            this.state = {}
        }
        Z.prototype.save = function() {
            var ad, aa, ac, ab;
            ac = {};
            ab = this.idToNode;
            for (ad in ab) {
                aa = ab[ad];
                ac[aa.id] = {x: aa.x, y: aa.y, r: aa.currentRadius}
            }
            return ac
        };
        Z.prototype.restore = function(ac) {
            var ae, ad, ab, aa;
            this.state = {};
            aa = [];
            for (ae in ac) {
                ab = ac[ae];
                if (this.idToNode.hasOwnProperty(ae)) {
                    ad = this.idToNode[ae];
                    ad.x = ab.x;
                    ad.y = ab.y;
                    aa.push(ad.currentRadius = ab.r)
                } else {
                    aa.push(this.state[ae] = ab)
                }
            }
            return aa
        };
        Z.prototype.removeAll = function() {
            var ag, ac, ae, ad, af, aa, ab;
            af = this.idToLink;
            for (ag in af) {
                ae = af[ag];
                this.removeLink(ag)
            }
            aa = this.idToNode;
            ab = [];
            for (ac in aa) {
                ad = aa[ac];
                ab.push(this.removeNode(ac))
            }
            return ab
        };
//        Z.prototype.runMovingMessage = function(a1, a2) { //keren
//            var node1;
//            var node2;
//            if (!this.idToNode.hasOwnProperty(a1) || !this.idToNode.hasOwnProperty(a2)) {
//                return this.chart.error("Locking nonexistant node: " + a1 + " or " + a2);
//            } else {
//                node1 = this.idToNode[a1];
//                node2 = this.idToNode[a2];
//                node1.runMovingMessage = true;
//                node1.toId = a2;
//
//                return this.scene.touchNode(node1)
//            }
//        };
        Z.prototype.lockNode = function(ab, aa, ad) {
            var ac;
            if (!this.idToNode.hasOwnProperty(ab)) {
                return this.chart.error("Locking nonexistant node: " + ab)
            } else {
                ac = this.idToNode[ab];
                ac.userLock = true;
                if (aa !== void 0 && ad !== void 0) {
                    ac.x = aa;
                    ac.y = ad
                }
                return this.scene.touchNode(ac)
            }
        };
        Z.prototype.unlockNode = function(aa) {
            var ab;
            if (!this.idToNode.hasOwnProperty(aa)) {
                return this.chart.error("Locking nonexistant node: " + aa)
            } else {
                ab = this.idToNode[aa];
                ab.userLock = false;
                return this.scene.touchNode(ab)
            }
        };
        Z.prototype.addNode = function(ac) {
            var ab, ad, aa;
            if (this.idToNode.hasOwnProperty(ac)) {
                return this.idToNode[ac]
            }
            ad = this.scene.addNode(ac);
            ad.dataLinks = [];
            this.idToNode[ac] = ad;
            if (this.state.hasOwnProperty(ac)) {
                aa = this.state[ac];
                delete this.state[ac];
                ad.x = aa.x;
                ad.y = aa.y;
                ad.currentRadius = aa.r
            }
            ab = this.scene.data.getNodeData(ac);
            if (ab != null) {
                this.addNodeImpl(ac, ab)
            } else {
                this.nodeQueue[ac] = true;
                ad.loading = true;
                this.toggleLoading()
            }
            return ad
        };
        Z.prototype.addNodeWithLinks = function(aa) {
            var ab;
            ab = this.addNode(aa);
            if (!ab.data || !ab.data.expanded) {
                this.scene.data.getNodeLinks(aa);
                this.linksQueue[aa] = true;
                ab.loading = true;
                this.toggleLoading()
            }
            return ab
        };
        Z.prototype.addNodeImpl = function(ad, ac) {
            var ab, aa, ae;
            ab = this.linksQueue.hasOwnProperty(ad);
            ae = this.idToNode[ad];
            ae.data = ac;
            ae.loading = false;
            this.scene.touchNode(ae);
            if (this.scene.settings.data.preloadNodeLinks || ab) {
                aa = this.scene.data.getNodeLinks(ad)
            } else {
                aa = this.scene.data.getNodeCollectedLinks(ad)
            }
            if (aa != null) {
                delete this.linksQueue[ad];
                this.updateNodeLinks(ae, aa)
            } else {
                ae.loading = true;
                this.linksQueue[ad] = true;
                this.updateNodeLinks(ae, this.scene.data.getNodeCollectedLinks(ad));
                this.toggleLoading()
            }
            return ae
        };
        Z.prototype.expandNode = function(aa) {
            var ab;
            ab = this.addNodeWithLinks(aa);
            if (!ab.expanded) {
                ab.expanded = true;
                this.expandImpl(ab);
                return this.scene.touchNode(ab)
            }
        };
        Z.prototype.expandImpl = function(ae) {
            var ad, ac, ag, ab, af, aa;
            if (!ae.dataLinks) {
                return
            }
            af = ae.dataLinks;
            aa = [];
            for (ag = 0, ab = af.length; ag < ab; ag++) {
                ad = af[ag];
                ac = k.otherEnd(ad, ae.id);
                aa.push(this.addNode(ac))
            }
            return aa
        };
        Z.prototype.collapseNode = function(ac) {
            var ag, ak, al, an, ab, aj, ai, af, ae, am, aa, ah, ad;
            ab = this.idToNode[ac];
            if (!ab) {
                return
            }
            ab.expanded = false;
            this.scene.touchNode(ab);
            an = ab.links.slice(0);
            ad = [];
            for (af = 0, am = an.length; af < am; af++) {
                ak = an[af];
                aj = ak.otherEnd(ab);
                if (aj === ab) {
                    continue
                }
                ag = true;
                ah = aj.links;
                for (ae = 0, aa = ah.length; ae < aa; ae++) {
                    al = ah[ae];
                    ai = al.otherEnd(aj);
                    if (ai !== aj && ai !== ab) {
                        ag = false;
                        break
                    }
                }
                if (ag) {
                    ad.push(this.removeNode(aj.id))
                } else {
                    ad.push(void 0)
                }
            }
            return ad
        };
        Z.prototype.updateNodeLinks = function(ab, ai) {
            var af, ag, ae, aa, ad, ah, ac;
            ab.dataLinks = ai;
            aa = {};
            for (ad = 0, ah = ai.length; ad < ah; ad++) {
                ag = ai[ad];
                af = this.tryAddLink(ag);
                if (af) {
                    aa[ag.id] = true
                }
            }
            ae = 0;
            ac = [];
            while (ae < ab.links.length) {
                af = ab.links[ae];
                if (!aa.hasOwnProperty(af.id) && this.idToLink.hasOwnProperty(af.id)) {
                    ac.push(this.removeLink(af.id))
                } else {
                    ac.push(ae++)
                }
            }
            return ac
        };
        Z.prototype.tryAddLink = function(aa) {
            var ab;
            if (this.idToLink.hasOwnProperty(aa.id)) {
                return this.idToLink[aa.id]
            }
            if (this.idToNode.hasOwnProperty(aa.from) && this.idToNode.hasOwnProperty(aa.to)) {
                ab = this.scene.addLink(aa.id, aa.from, aa.to);
                ab.data = aa;
                this.idToLink[aa.id] = ab;
                ab.from = this.idToNode[aa.from];
                ab.from.links.push(ab);
                this.scene.touchNode(ab.from);
                ab.to = this.idToNode[aa.to];
                ab.to.links.push(ab);
                this.scene.touchNode(ab.to);
                return ab
            } else {
                return null
            }
        };
        Z.prototype.removeNode = function(ag) {
            var ad, ac, aa, af, ab, ae;
            if (!this.idToNode.hasOwnProperty(ag)) {
                return
            }
            ac = this.idToNode[ag];
            ae = ac.links;
            for (af = 0, ab = ae.length; af < ab; af++) {
                ad = ae[af];
                delete this.idToLink[ad.id];
                aa = ad.otherEnd(ac);
                if (aa !== ac) {
                    Q.removeFromArray(aa.links, ad);
                    this.scene.touchNode(aa)
                }
                this.scene.removeLink(ad)
            }
            ac.links = [];
            delete this.idToNode[ag];
            delete this.nodeQueue[ag];
            delete this.linksQueue[ag];
            this.scene.removeNode(ac);
            this.scene.data.nodeRemoved(ag);
            return this.toggleLoading()
        };
        Z.prototype.removeLink = function(ab) {
            var aa;
            if (this.idToLink.hasOwnProperty(ab)) {
                aa = this.idToLink[ab];
                delete this.idToLink[ab];
                Q.removeFromArray(aa.from.links, aa);
                Q.removeFromArray(aa.to.links, aa);
                this.scene.touchNode(aa.from);
                this.scene.touchNode(aa.to);
                return this.scene.removeLink(aa)
            }
        };
        Z.prototype.onSceneChange = function(aa) {
            var ah, aj, ac, am, ad, al, ag, af, ak, ab, ai, ae;
            if (!aa.changes.dataArrived) {
                return
            }
            aj = false;
            ah = [];
            ai = aa.changes.dataNodesIds;
            for (ac in ai) {
                al = ai[ac];
                ah.push(ac)
            }
            ah.sort();
            for (ag = 0, ak = ah.length; ag < ak; ag++) {
                ac = ah[ag];
                if (this.nodeQueue.hasOwnProperty(ac)) {
                    delete this.nodeQueue[ac];
                    this.addNodeImpl(ac, this.scene.data.getNodeData(ac));
                    aj = true
                } else {
                    if (this.idToNode.hasOwnProperty(ac)) {
                        this.scene.touchNode(this.idToNode[ac])
                    }
                }
            }
            ah = [];
            ae = aa.changes.dataExpandedNodeIds;
            for (ac in ae) {
                al = ae[ac];
                ah.push(ac)
            }
            ah.sort();
            for (af = 0, ab = ah.length; af < ab; af++) {
                ac = ah[af];
                delete this.linksQueue[ac];
                if (this.idToNode.hasOwnProperty(ac)) {
                    am = this.scene.data.getNodeLinks(ac);
                    if (am === null) {
                        this.chart.error("Internal error - no links for exapnded node");
                        continue
                    }
                    ad = this.idToNode[ac];
                    ad.loading = false;
                    this.updateNodeLinks(ad, am);
                    if (ad.expanded) {
                        this.expandImpl(ad)
                    }
                    aj = true
                }
            }
            return this.toggleLoading()
        };
        Z.prototype.updateFilter = function() {
            var aj, ab, aa, al, an, ac, ag, ak, ah, am, ai, af, ad, ae;
            ag = this.settings.filters.nodeFilter;
            ab = {};
            aj = this.scene.data;
            ai = this.idToNode;
            for (aa in ai) {
                ac = ai[aa];
                ak = aj.nodeToLinks[aa];
                if (ag && ac.data && !ag(ac.data, ak)) {
                    this.removeNode(ac.id)
                } else {
                    ac.dataLinks = aj.getNodeCollectedLinks(aa);
                    af = ac.dataLinks;
                    for (ah = 0, am = af.length; ah < am; ah++) {
                        an = af[ah];
                        ab[an.id] = true;
                        this.tryAddLink(an)
                    }
                }
            }
            ad = this.idToLink;
            ae = [];
            for (aa in ad) {
                al = ad[aa];
                if (!ab.hasOwnProperty(aa)) {
                    ae.push(this.removeLink(aa))
                } else {
                    ae.push(void 0)
                }
            }
            return ae
        };
        Z.prototype.toggleLoading = function() {
            if (Q.hasProperties(this.nodeQueue) || Q.hasProperties(this.linksQueue)) {
                if (!this.scene.loading) {
                    return this.scene.loading = true
                }
            } else {
                if (this.scene.loading) {
                    return this.scene.loading = false
                }
            }
        };
        return Z
    })();
    var z;
    z = (function() {
        Z.prototype.FocusNode = (function() {
            function aa() {
            }
            aa.prototype.id = null;
            aa.prototype.relevance = -1;
            aa.prototype.initial = false;
            aa.prototype.stopped = false;
            aa.prototype.hidden = false;
            aa.prototype.expanded = false;
            aa.prototype.collapsed = false;
            aa.prototype.runMovingMessage = false;
            aa.prototype.toId = false;
            aa.prototype.actionId = 0;
            return aa
        })();
        Z.prototype.lastExpandTime = 0;
        Z.prototype.nextId = 0;
        Z.prototype.animationPriority = 1005;
        Z.prototype.otherEnd = k.otherEnd;
        function Z(aa) {
            this.chart = aa;
            this.graph = this.chart.graph;
            this.scene = this.chart.scene;
            this.nodes = {}
        }
        Z.prototype.clear = function() {
            this.chart.events.notifySceneChanges({navigation: true});
            return this.nodes = {}
        };
        Z.prototype.addAction = function(ac, ab) {
            var aa;
            this.chart.events.notifySceneChanges({navigation: true});
            aa = new this.FocusNode();
            aa.id = ac;
            aa.actionId = this.nextId;
            this.nextId += 1;
            Q.extend(aa, ab);
            this.nodes[ac] = aa;
            return aa
        };
        Z.prototype.updateAction = function(ac, ab) {
            var aa;
            this.chart.events.notifySceneChanges({navigation: true});
            aa = this.nodes[ac];
            aa.actionId = this.nextId;
            this.nextId += 1;
            Q.extend(aa, ab);
            return aa
        };
        Z.prototype.hideNode = function(aa) {
            return this.addAction(aa, {hidden: true})
        };
        Z.prototype.collapseNode = function(aa) {
            return this.addAction(aa, {collapsed: true})
        };
        Z.prototype.addFocusNode = function(aa, ab) {
            if (ab == null) {
                ab = -1
            }
            return this.addAction(aa, {relevance: ab, initial: true})
        };
        Z.prototype.expandNode = function(aa) {
            if (this.nodes[aa] && this.nodes[aa].initial) {
                return this.updateAction(aa, {expanded: true})
            } else {
                return this.addAction(aa, {expanded: true})
            }
        };
        Z.prototype.runMovingMessage = function(nodeId1, nodeId2, messageType) {
            if ((this.nodes[nodeId1] && this.nodes[nodeId1].initial)) {
                this.updateAction(nodeId1, {runMovingMessage: true, id1: nodeId1, id2: nodeId2, runMovingMessageStepX: 0, runMovingMessageType: messageType});
            } else {
                this.addAction(nodeId1, {runMovingMessage: true, id1: nodeId1, id2: nodeId2, runMovingMessageStepX: 0, runMovingMessageType: messageType});
            }
            if ((this.nodes[nodeId2] && this.nodes[nodeId2].initial)) {
                this.updateAction(nodeId2, {runMovingMessage: true, id1: nodeId1, id2: nodeId2, runMovingMessageStepX: 0, runMovingMessageType: messageType});
            } else {
                this.addAction(nodeId2, {runMovingMessage: true, id1: nodeId1, id2: nodeId2, runMovingMessageStepX: 0, runMovingMessageType: messageType});
            }
            return;
        };
        Z.prototype.unexpandNode = function(aa) {
            if (this.nodes[aa]) {
                return this.updateAction(aa, {initial: false})
            }
        };
        Z.prototype.save = function() {
            return this.nodes
        };
        Z.prototype.restore = function(ac) {
            var aa, ad, ab;
            this.nodes = ac;
            this.nextId = 0;
            ab = this.nodes;
            for (ad in ab) {
                aa = ab[ad];
                this.nextId = Math.max(aa.actionId, this.nextId)
            }
            this.nextId++;
            return this.chart.events.notifySceneChanges({navigation: true})
        };
        Z.prototype.showInitialNodes = function() {
            var ai, aa, ac, ah, ag, al, ab, aj, af, ae, ad, ak = this;
            this.clear();
            this.graph.removeAll();
            ac = this.scene.settings.navigation;
            if (ac.mode === "focusnodes") {
                if (ac.initialNodes && ac.initialNodes.length) {
                    aj = ac.initialNodes;
                    ae = [];
                    for (ah = 0, al = aj.length; ah < al; ah++) {
                        aa = aj[ah];
                        this.scene.userNodeIds[aa] = true;
                        ae.push(this.addFocusNode(aa, -1))
                    }
                    return ae
                }
            } else {
                if (ac.mode === "manual") {
                    if (ac.initialNodes && ac.initialNodes.length) {
                        af = ac.initialNodes;
                        ad = [];
                        for (ag = 0, ab = af.length; ag < ab; ag++) {
                            aa = af[ag];
                            this.scene.userNodeIds[aa] = true;
                            ad.push(this.addFocusNode(aa, 1))
                        }
                        return ad
                    }
                } else {
                    if (ac.mode === "showall" || true) {
                        ai = function(an) {
                            var ap, am, ao;
                            ao = [];
                            for (ap = 0, am = an.length; ap < am; ap++) {
                                aa = an[ap];
                                ao.push(ak.graph.expandNode(aa))
                            }
                            return ao
                        };
                        return this.scene.data.getAllNodes(ai)
                    }
                }
            }
        };
        Z.prototype.doAnimations = function(aa) {
            if (!(aa.changes.navigation || aa.changes.dataArrived || this.scene.hasTopologyChanges() || aa.changes.settings || aa.changes.data)) {
                return
            }
            return this.updateGraph()
        };
        Z.prototype.updateGraph = function() {
            var ad, aa, ac, ab;
            ac = new Date().getTime();
            if (this.scene.settings.navigation.expandDelay && this.lastExpandTime > ac - this.scene.settings.navigation.expandDelay) {
                this.chart.events.notifySceneChanges({navigation: true});
                return
            }
            this.lastExpandTime = ac;
            this.resolveConflicts();
            ab = this.computeRelevances(), aa = ab[0], ad = ab[1];
            return this.applyRelevances(aa, ad)
        };
        Z.prototype.resolveConflicts = function() {
            var an, am, ah, aa, aj, ao, ac, ab, ai, al, af, ak, ag, ae, ad;
            ag = this.nodes;
            ad = [];
            for (ab in ag) {
                an = ag[ab];
                if (this.scene.settings.navigation.mode !== "focusnodes" && this.scene.data.isFilteredNode(ab)) {
                    delete this.nodes[ab];
                    continue
                }
                if (!an.initial && !an.hidden && !this.graph.idToNode.hasOwnProperty(ab)) {
                    delete this.nodes[ab];
                    continue
                }
                if (an.expanded) {
                    ao = this.scene.data.getNodeCollectedLinks(ab);
                    for (af = 0, ak = ao.length; af < ak; af++) {
                        aj = ao[af];
                        al = this.otherEnd(aj, ab);
                        ai = this.nodes[al];
                        if (ai && ai.actionId < an.actionId && ai.hidden) {
                            delete this.nodes[al]
                        }
                    }
                }
                if (this.scene.settings.navigation.mode === "focusnodes") {
                    ac = this.scene.settings.navigation.numberOfFocusNodes;
                    am = [];
                    ae = this.nodes;
                    for (aa in ae) {
                        an = ae[aa];
                        if (an.initial) {
                            am.push(an)
                        }
                    }
                    am.sort(function(aq, ap) {
                        return aq.actionId - ap.actionId
                    });
                    ah = 0;
                    ad.push((function() {
                        var ap;
                        ap = [];
                        while (am.length - ah > ac) {
                            am[ah].initial = false;
                            ap.push(ah++)
                        }
                        return ap
                    })())
                } else {
                    ad.push(void 0)
                }
            }
            return ad
        };
        Z.prototype.computeRelevances = function() {
            var az, aD, aw, aq, aC, ab, ak, aa, ae, ax, ac, au, am, ag, ar, an, al, ap, av, at, aj, aB, af, ad, ay, aA, ao, ai, ah;
            this.changes = false;
            ax = {};
            ae = {};
            av = {};
            ak = !!this.scene.settings.navigation.expandDelay;
            aa = false;
            aD = this.scene.settings.navigation.nodeAutoExpandFilter;
            ar = this.scene.settings.navigation.mode;
            if (ar === "focusnodes") {
                ac = [];
                ao = this.nodes;
                for (au in ao) {
                    az = ao[au];
                    if (az.initial) {
                        ac.push(az)
                    }
                }
                ac.sort(function(aF, aE) {
                    return aE.actionId - aF.actionId
                });
                aq = this.scene.settings.navigation.focusHistoryRelevanceCooldown;
                aw = 0;
                for (af = 0, ay = ac.length; af < ay; af++) {
                    az = ac[af];
                    au = az.id;
                    at = az.relevance;
                    if (at < 0) {
                        at = 1 + parseFloat(this.scene.settings.navigation.focusNodeExpansionRadius)
                    }
                    at = Math.max(0, at - aw);
                    aw += aq;
                    ax[au] = at;
                    av[au] = true
                }
            } else {
                if (ar === "manual") {
                    ai = this.nodes;
                    for (au in ai) {
                        az = ai[au];
                        av[au] = true;
                        ax[au] = 1
                    }
                } else {
                    ah = this.scene.data.getNodes();
                    for (au in ah) {
                        aC = ah[au];
                        av[au] = true;
                        ax[au] = 1.01
                    }
                }
            }
            while (Q.hasProperties(av)) {
                ap = {};
                for (au in av) {
                    aB = av[au];
                    aj = ax[au];
                    az = this.nodes[au];
                    if (az) {
                        if (az.hidden) {
                            delete ax[au];
                            continue
                        }
                        ab = az.expanded || (aj > 1 && !az.collapsed) && !ae.hasOwnProperty(au)
                    } else {
                        ab = aj > 1
                    }
                    if (!ab && aD) {
                        1
                    }
                    if (ab && ak && !this.graph.idToNode.hasOwnProperty(au)) {
                        aa = true;
                        ab = false
                    }
                    if (ab && !ae.hasOwnProperty(au)) {
                        ae[au] = true;
                        ag = this.scene.data.getNodeLinks(au);
                        if (ag == null) {
                            ag = this.scene.data.getNodeCollectedLinks(au)
                        }
                        al = aj - 1;
                        for (ad = 0, aA = ag.length; ad < aA; ad++) {
                            am = ag[ad];
                            an = this.otherEnd(am, au);
                            if (!ax.hasOwnProperty(an) || al > ax[an]) {
                                ax[an] = al;
                                ap[an] = true
                            }
                        }
                    }
                }
                av = ap
            }
            if (aa) {
                this.chart.events.notifySceneChanges({navigation: true})
            }
            return[ax, ae]
        };
        Z.prototype.applyRelevances = function(ae, aj) {
            var ak, ai, al, am, ag, an, ab, aa, ah, ao, af, ad, ac;
            an = 1;
            for (aa in ae) {
                ao = ae[aa];
                an = Math.max(an, ao);
                ak = aj.hasOwnProperty(aa);
                ab = this.graph.addNode(aa);
                if (ak) {
                    this.graph.addNodeWithLinks(aa)
                }
                ai = this.nodes[aa] && this.nodes[aa].initial;
                if (ak !== ab.expanded || ai !== ab.focused || ab.relevance !== ao) {
                    ab.expanded = ak;
                    ab.focused = ai;
                    ab.relevance = ao;
                    this.scene.touchNode(ab)
                }
            }
            af = this.graph.idToNode;
            for (ah in af) {
                ab = af[ah];
                if (!ae.hasOwnProperty(ah)) {
                    ab.relevance = 0;
                    this.graph.removeNode(ah)
                }
            }
            ad = this.graph.idToLink;
            ac = [];
            for (am in ad) {
                al = ad[am];
                ac.push(al.relevance = ag = Math.min(al.from.relevance, al.to.relevance))
            }
            return ac
        };
        return Z
    })();
    var D;
    D = (function() {
        function Z() {
        }
        Z["export"] = function(ag, ad) {
            var ao, am, at, aa, ae, al, ab, aq, aj, ak, ai, an, ap, ah, af, ar, ac;
            if (ad.type === void 0) {
                ad.type = "png"
            }
            if (ad.transparent === void 0) {
                ad.transparent = ad.type === "png"
            }
            if (ad.dimensions === void 0) {
                ad.dimensions = {}
            }
            if (ad.type === "png" || ad.type === "jpeg") {
                aq = {png: "image/png", jpeg: "image/jpeg"};
                ab = aq[ad.type];
                ak = ag.saveAsImage(ad.type, ad.dimensions, ad.transparent);
                return this.proxyExport(ag, ab, ak, "base64", ad.dimensions)
            } else {
                if (ad.type === "pdf") {
                    af = [ag._impl.scene.chartWidth, ag._impl.scene.chartHeight];
                    ai = [10, 10, 10, 10];
                    ao = [];
                    ah = ap = 0;
                    ae = am = 0;
                    aa = 72;
                    ar = 1;
                    ac = al = 0;
                    if (af[0] >= af[1]) {
                        ao = [297, 210];
                        aj = "l"
                    } else {
                        ao = [210, 297];
                        aj = "p"
                    }
                    ah = ao[0] / 25.4 * aa;
                    ap = ao[1] / 25.4 * aa;
                    ar = Math.min(ap / af[1], ah / af[0]);
                    if (aj === "l") {
                        ac = af[0] * ar / ah * ao[0] - ai[1] - ai[3];
                        ae = (ao[0] - ac - ai[1] - ai[3]) / 2;
                        al = af[1] / af[0] * ac;
                        am = (ao[1] - ai[0] - ai[2] - al) / 2
                    } else {
                        al = af[1] * ar / ap * ao[1] - ai[0] - ai[2];
                        am = (ao[1] - al - ai[0] - ai[2]) / 2;
                        ac = af[0] / af[1] * al;
                        ae = (ao[0] - ai[1] - ai[3] - ac) / 2
                    }
                    ak = ag.saveAsImage("jpeg", {scaling: ar * 3}, ad.transparent);
                    ak = ak.slice("data:image/jpeg;base64,".length);
                    ak = atob(ak);
                    at = new jsPDF(aj, "mm", "a4");
                    at.addImage(ak, "JPEG", ai[3] + ae, ai[0] + am, ac, al);
                    an = at.output("datauristring");
                    return this.proxyExport(ag, "application/pdf", an, "base64", {})
                } else {
                    return ag._impl.error("Unrecognized export type: " + ad.type)
                }
            }
        };
        Z.proxyExport = function(ai, aj, ag, ab, aa) {
            var ak, ah, af, ae, ad, ac;
            ah = Q.createDom("form");
            ah.setAttribute("action", ai._impl.settings.advanced.exportProxyURL);
            ah.setAttribute("method", "POST");
            ah.setAttribute("style", "display:none");
            af = Q.createDom("input", null, null, ah);
            af.setAttribute("type", "hidden");
            af.setAttribute("name", "type");
            af.setAttribute("value", aj);
            ae = Q.createDom("input", null, null, ah);
            ae.setAttribute("type", "hidden");
            ae.setAttribute("name", "encoding");
            ae.setAttribute("value", ab);
            ad = Q.createDom("input", null, null, ah);
            ad.setAttribute("type", "hidden");
            ad.setAttribute("name", "data");
            ad.setAttribute("value", ag);
            if (aa.dpi != null) {
                ac = Q.createDom("input", null, null, ah);
                ac.setAttribute("type", "hidden");
                ac.setAttribute("name", "setdpi");
                ac.setAttribute("value", parseInt(aa.dpi))
            }
            ak = document.getElementsByTagName("body")[0];
            ak.appendChild(ah);
            ah.submit();
            return ak.removeChild(ah)
        };
        return Z
    })();
    var K = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAHMAAAA0CAYAAAC5HgcyAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAACMBJREFUeNrsXGtsFFUUPrOzfdPC8rQkQFwiJKhEUxKIr/CjVRMTX0kJJBqUaIH6gOCPbTD6C0MbTAyS1LQhFDUqodEIGsBsxVp5CoWgxQJNl6UNbcFC6XvZ7e547uyZ9nY6uzuzXUp3nJOczs6dM2fu3O+ec8+5c3sFqRj0UxBZ0ryShuxAvjEsEQI4OsMBmxcuhBRJAmFEdjnybuSnkLtZgYDCQUiHRtgKPpiPJQFe99vIXmT3mKfaRICUVDBC0tolYFayH7+uT1BENFbMwR8p6raW6Wnkz5GXIQ8oYD7g94M4VtUV5C3I/SNFIVQ5FYFcgMgG1R3m4bA2dYXsAIOooumcwVc2L5iCEeGVcwFKHgN4bt4YC81GRiTgonwFm74pKwOKFy2CmykpsmXGsBesiATXpDXwr/gC1moIvYA/cvXs2KNutgLsfA+g46oxy4xZl+QlmxHh2jaA5w8BnOxgDTrqUi9yg4wKtlUgzQZblzwEralpkDrSeMx/voGco9WnhBQbzGqpAPh0HUBPJ1peSpQuiNUe7DMMpNnJFs9N/mAUm0a/+ssNO9Se6oNpmQhS6vAjXkSuQn6UztHOYRYPkCQggJdPAxzZC5CRNcoWST78VAEPaZkWeokAs21gFJgvI+9CDrcu4jF4yw+dVR5oLm+GgZYBEDNExErYh1efRT6LvAb5b+QLyAVyRRD0QPdQWOMtNP3QqGFyNfI15CfAZguPl3XfW+glAswNfwBcvzPsap9BXkfjpkz7vOFj5/FOaNzWCJ7dHvlUsAssIr2LXII8HTkXeZOYKUL3xW7wVtGNF2oBLiHmmTnK4PyPbNU2W6tskd+Vofl/aaGXCDB7MJrdUIeoBGW3+iH+dcppCSYo5ecBDni5ODUQgs66TmiubCZvKpt07bBXThd/723shaadTTDUT5Y5hA8ox4D3KhpvRjaLWs7hjUWQltUC+3YAHK4aFdCYOai5Z9EsjXFTkduxAfujKhYElpU8yIZY5BZWNvPJmeAsckLQF2R56Wpbim3Q1+GrbvykUUIgZ1NwZET3XZRtpbL/fTSr6+W53n+d/N4xvlyLkcpJdiCWLMm3k3ydDtlKku03apl66pKsbBRMZjEbw8UxFbPZnR0Oh0PSWRGW3hTr1I15CWxnRwvMERaMuCV0ZTfxfDYeWYMLMVzhHZSZlpubK7W3t8d8Dsoz95qrU3cvymQr91huNr4AyMgYKxlsPMO64w3gLDAtssC0yALTIgtMC0yLLDDv+2yURRMNpt78D7TWL1hkiOwT9aAV367wDvUNLVDbIgP7zFtnGOJ+C44kcbNSSOqJcKnHcrNWAGSRScC0rDhJwAzpkAla0GkHQGz5BlspUA+RljhPLMnrboWqi0EI+EZfyZgC0uuLRW6c1Uts7S37fOc1u2X+iHwGeROdq/m+RL/Yr2w66mNT/dbildRRT0F4dYKpLXMe/f4M+aMoeSJbLnJyktV/D/v+icfbUWSm05Gtx88yNZiSJCVtb8W6u/DgskZLKzUxn2UamG5TrMFqtUk8ZiYt8R3R6mSWm7UsM4ktuQgPbO1nmZZ1J4hYzl5I6VDNBASBE2KZk3HKjTVy6T1+hpOekZcsbnZIh4zPcnzJ4WbDH5KLMWFXz5KyLQZ2yYuYB63mTQ4whQTJ3Osx0sG5O08CVefTsYvGxkQQq6eDfkcaa9Xv4zF9NMtARGb/C8qm+dzEzRwIihz7x19JXc5RM11XGrlIpfMsyRSOs2M0ky5FL3umSwViqcb7uPEdnKaNZska3dSD2X+LVXM938UBA3S9gsCo0bAUJ8l0cQ3KaBWVKZGrZxzW6CZdJZyV56l0KnWspvooncBFgC7DqLbLjKlJETVGCZ+CMLDwpfN5K8TrlVhWSveUUKPyeoBrPMUNlnAdhL8eDymdo0DlrmtUlqsAuUol00U6WF3LzOhm8wmoMp3yZSrwFLem5Ir13PiopDeOBNTTQXWtiTHu5kfpNLyVglnBNJKsV2uAqQDGN6ACbB6NV6XkZscT8ICOukaT66Jy04JplDwEmpMLZIqoodTWUEBlDhqvmidgEuKeTxqYYz5orHUWEqh5nPtVW8J6CH/wXk/nk+abqm2iAArdDQkR5COUxl21+iipRqSxThm3Crl7q6M8Q7HaZapxzWg9QUdaUxNDLl/RFW+LiToSm1F7IPpv+W8L4ljcsKxXJR/WmpamW7dWI9GkOp+y5EH0+dJKLsKs1pludBkMePJU9ypjcL4O0Is0rrn4jhcvmOGN7YJwfowGcXi3SrYVDHR0dFTaRNuFwbbBg2L6aAzYrlz+2/6f6VQBNYxiIPCXvBMXb8D21D46maUHFATQxdIRAnZ/jKiRzye1Ikcn5YQuLl2o0LBiPurlU6GzxDwoJXTcz+nNpw5VyllmNZW7Ob0uklHG/LjBbMIGOre3AbYEBTghN3+aDHHLMS+sm54uVA4DDvCrFJKWth1o6/a1+z62Z9p72PZr9ix7IDgQ/KbtYNsPqIstr6xVZl3w/E/4bf9mdLWnISsHIDMb9ad74fzRN4WsnD3RLBNTknouHyulBqjg8zSy0khpiidC5OiEkS8ibgKgkO6JFPUqszXRXKi6rm4NK1xPz8mn57pJnt1fwCYM4gpL5C1KBOE1/Pk18qHls2H7/ByYAhKIfQHoOtwCr2L5B8hfoGwxyrI99dgyx8Vome/mPJJzBWWz0b36+jx96f5OP9svaAZ7eZS/hPJr8fde5J9g4dIymDE3G0IhEXx9XdBwgjXeZgjv1fe+ul4as0GKVdQrL6who3aFjhgu1smlJPVRXK0yyVDPWbwzindQ5KPN946Zmx3XCgvu5m00h8j4BFlWD50z15nNybJFyE10zUs9q4HO2deVV1S6t3O6j5PuXjo/ABpLJs28v0/CNnWKAiajl5h1IrNtEQfIAt9RghiV7BxyDZch/O97bLevr5Afj/AoBvARCG8OxXSzNbsbI4VdFpgS/CfAAOjmUutlIPngAAAAAElFTkSuQmCC";
    var a;
    a = (function() {
        function Z() {
        }
        Z.closestPointToLine = function(ab, ag, aa, ae, af, ad) {
            var aj, ai, ac, ah;
            aj = aa - ab;
            ai = ae - ag;
            ac = aj * aj + ai * ai;
            if (ac > 0) {
                ah = (((af - ab) * aj) + (ad - ag) * ai) / ac;
                ah = Math.min(Math.max(ah, 0), 1)
            } else {
                ah = 0
            }
            return[ab + aj * ah, ag + ai * ah]
        };
        Z.rayIntersectsLine = function(ac, ab, am, al, ae, ad, ai, af) {
            var ak, aa, ah, ag, an, aj;
            ak = Infinity;
            ah = ai - ae;
            ag = af - ad;
            aa = am * ag - al * ah;
            if (aa !== 0) {
                aj = (ab * ah - ac * ag + ae * ag - ad * ah) / aa;
                if (Math.abs(ah) > Math.abs(ag)) {
                    an = (ac + am * aj - ae) / ah
                } else {
                    an = (ab + al * aj - ad) / ag
                }
                if (an >= 0 && an <= 1 && aj >= 0) {
                    ak = aj
                }
            }
            return ak
        };
        Z.rayIntersectsCircle = function(ac, ab, ak, ai, aa) {
            var al, aj, ag, ah, af, ae, ad;
            al = ak * ak + ai * ai;
            aj = ac * ak + ab * ai;
            ag = ac * ac + ab * ab - aa * aa;
            af = aj * aj - al * ag;
            ah = Infinity;
            if (af > 0) {
                af = Math.sqrt(af);
                ae = (-aj - af) / al;
                ad = (-aj + af) / al;
                if (ae >= 0) {
                    ah = ae
                }
                if (ad >= 0) {
                    ah = Math.min(ah, ad)
                }
            }
            return ah
        };
        Z.lineTouchingCircle = function(ad, ac, ae, aj, ab) {
            var ai, af, ah, al, ak, ag, aa;
            ai = Math.sqrt(ad * ad + ac * ac);
            if (!(ai > ab)) {
                return null
            }
            ah = Math.sqrt(ai * ai - ab * ab);
            ag = ab * ah / ai;
            aa = ab * ab / ai;
            al = ad / ai;
            ak = ac / ai;
            af = ad * aj - ac * ae;
            if (af < 0) {
                ag = -ag
            }
            return[al * aa - ak * ag, ak * aa + al * ag]
        };
        return Z
    })();
    var f;
    f = (function() {
        function Z(aa) {
            this.seed = aa;
            this.A = 48271;
            this.M = 2147483647;
            this.Q = this.M / this.A;
            this.R = this.M % this.A;
            this.oneOverM = 1 / this.M
        }
        Z.prototype.get = function() {
            var aa, ab, ac;
            aa = this.seed / this.Q;
            ab = this.seed % this.Q;
            ac = this.A * ab - this.R * aa;
            if (ac > 0) {
                this.seed = ac
            } else {
                this.seed = ac + this.M
            }
            return this.seed * this.oneOverM
        };
        return Z
    })();
    var j;
    j = (function() {
        function Z() {
        }
        Z.clamp_css_byte = function(aa) {
            aa = Math.round(aa);
            if (aa < 0) {
                return 0
            } else {
                if (aa > 255) {
                    return 255
                } else {
                    return aa
                }
            }
        };
        Z.clamp_css_float = function(aa) {
            if (aa < 0) {
                return 0
            } else {
                if (aa > 1) {
                    return 1
                } else {
                    return aa
                }
            }
        };
        Z.parse_css_int = function(aa) {
            if (aa[aa.length - 1] === "%") {
                return Z.clamp_css_byte(parseFloat(aa) / 100 * 255)
            }
            return Z.clamp_css_byte(parseInt(aa))
        };
        Z.parse_css_float = function(aa) {
            if (aa[aa.length - 1] === "%") {
                return Z.clamp_css_float(parseFloat(aa) / 100)
            }
            return Z.clamp_css_float(parseFloat(aa))
        };
        Z.css_hue_to_rgb = function(ab, aa, ac) {
            if (ac < 0) {
                ac += 1
            } else {
                if (ac > 1) {
                    ac -= 1
                }
            }
            if (ac * 6 < 1) {
                return ab + (aa - ab) * ac * 6
            }
            if (ac * 2 < 1) {
                return aa
            }
            if (ac * 3 < 2) {
                return ab + (aa - ab) * (2 / 3 - ac) * 6
            }
            return ab
        };
        Z.parseCSSColor = function(aj) {
            var ad, am, aa, af, ae, ab, ak, ai, ag, ac, al, ah;
            ah = aj.replace(RegExp(" ", "g"), "").toLowerCase();
            if (ah in Z.kCSSColorTable) {
                return Z.kCSSColorTable[ah].slice()
            }
            if (ah[0] === "#") {
                if (ah.length === 4) {
                    ae = parseInt(ah.substr(1), 16);
                    if (!(ae >= 0 && ae <= 4095)) {
                        return null
                    }
                    return[((ae & 3840) >> 4) | ((ae & 3840) >> 8), (ae & 240) | ((ae & 240) >> 4), (ae & 15) | ((ae & 15) << 4), 1]
                } else {
                    if (ah.length === 7) {
                        ae = parseInt(ah.substr(1), 16);
                        if (!(ae >= 0 && ae < 16777215)) {
                            return null
                        }
                        return[(ae & 16711680) >> 16, (ae & 65280) >> 8, ae & 255, 1]
                    }
                }
                return null
            }
            ag = ah.indexOf("(");
            am = ah.indexOf(")");
            if (ag !== -1 && am + 1 === ah.length) {
                aa = ah.substr(0, ag);
                ac = ah.substr(ag + 1, am - (ag + 1)).split(",");
                ad = 1;
                if (aa === "rgba") {
                    if (ac.length !== 4) {
                        return null
                    }
                    ad = Z.parse_css_float(ac.pop())
                }
                if (aa === "rgba" || aa === "rgb") {
                    if (ac.length !== 3) {
                        return null
                    }
                    return[Z.parse_css_int(ac[0]), Z.parse_css_int(ac[1]), Z.parse_css_int(ac[2]), ad]
                }
                if (aa === "hsla") {
                    if (ac.length !== 4) {
                        return null
                    }
                    ad = Z.parse_css_float(ac.pop())
                }
                if (aa === "hsla" || aa === "hsl") {
                    if (ac.length !== 3) {
                        return null
                    }
                    af = (((parseFloat(ac[0]) % 360) + 360) % 360) / 360;
                    al = parse_css_float(ac[1]);
                    ab = parse_css_float(ac[2]);
                    ai = (ab <= 0.5 ? ab * (al + 1) : ab + al - ab * al);
                    ak = ab * 2 - ai;
                    return[Z.clamp_css_byte(Z.css_hue_to_rgb(ak, ai, af + 1 / 3) * 255), Z.clamp_css_byte(Z.css_hue_to_rgb(ak, ai, af) * 255), Z.clamp_css_byte(Z.css_hue_to_rgb(ak, ai, af - 1 / 3) * 255), ad]
                }
            }
            return null
        };
        Z.kCSSColorTable = {transparent: [0, 0, 0, 0], aliceblue: [240, 248, 255, 1], antiquewhite: [250, 235, 215, 1], aqua: [0, 255, 255, 1], aquamarine: [127, 255, 212, 1], azure: [240, 255, 255, 1], beige: [245, 245, 220, 1], bisque: [255, 228, 196, 1], black: [0, 0, 0, 1], blanchedalmond: [255, 235, 205, 1], blue: [0, 0, 255, 1], blueviolet: [138, 43, 226, 1], brown: [165, 42, 42, 1], burlywood: [222, 184, 135, 1], cadetblue: [95, 158, 160, 1], chartreuse: [127, 255, 0, 1], chocolate: [210, 105, 30, 1], coral: [255, 127, 80, 1], cornflowerblue: [100, 149, 237, 1], cornsilk: [255, 248, 220, 1], crimson: [220, 20, 60, 1], cyan: [0, 255, 255, 1], darkblue: [0, 0, 139, 1], darkcyan: [0, 139, 139, 1], darkgoldenrod: [184, 134, 11, 1], darkgray: [169, 169, 169, 1], darkgreen: [0, 100, 0, 1], darkgrey: [169, 169, 169, 1], darkkhaki: [189, 183, 107, 1], darkmagenta: [139, 0, 139, 1], darkolivegreen: [85, 107, 47, 1], darkorange: [255, 140, 0, 1], darkorchid: [153, 50, 204, 1], darkred: [139, 0, 0, 1], darksalmon: [233, 150, 122, 1], darkseagreen: [143, 188, 143, 1], darkslateblue: [72, 61, 139, 1], darkslategray: [47, 79, 79, 1], darkslategrey: [47, 79, 79, 1], darkturquoise: [0, 206, 209, 1], darkviolet: [148, 0, 211, 1], deeppink: [255, 20, 147, 1], deepskyblue: [0, 191, 255, 1], dimgray: [105, 105, 105, 1], dimgrey: [105, 105, 105, 1], dodgerblue: [30, 144, 255, 1], firebrick: [178, 34, 34, 1], floralwhite: [255, 250, 240, 1], forestgreen: [34, 139, 34, 1], fuchsia: [255, 0, 255, 1], gainsboro: [220, 220, 220, 1], ghostwhite: [248, 248, 255, 1], gold: [255, 215, 0, 1], goldenrod: [218, 165, 32, 1], gray: [128, 128, 128, 1], green: [0, 128, 0, 1], greenyellow: [173, 255, 47, 1], grey: [128, 128, 128, 1], honeydew: [240, 255, 240, 1], hotpink: [255, 105, 180, 1], indianred: [205, 92, 92, 1], indigo: [75, 0, 130, 1], ivory: [255, 255, 240, 1], khaki: [240, 230, 140, 1], lavender: [230, 230, 250, 1], lavenderblush: [255, 240, 245, 1], lawngreen: [124, 252, 0, 1], lemonchiffon: [255, 250, 205, 1], lightblue: [173, 216, 230, 1], lightcoral: [240, 128, 128, 1], lightcyan: [224, 255, 255, 1], lightgoldenrodyellow: [250, 250, 210, 1], lightgray: [211, 211, 211, 1], lightgreen: [144, 238, 144, 1], lightgrey: [211, 211, 211, 1], lightpink: [255, 182, 193, 1], lightsalmon: [255, 160, 122, 1], lightseagreen: [32, 178, 170, 1], lightskyblue: [135, 206, 250, 1], lightslategray: [119, 136, 153, 1], lightslategrey: [119, 136, 153, 1], lightsteelblue: [176, 196, 222, 1], lightyellow: [255, 255, 224, 1], lime: [0, 255, 0, 1], limegreen: [50, 205, 50, 1], linen: [250, 240, 230, 1], magenta: [255, 0, 255, 1], maroon: [128, 0, 0, 1], mediumaquamarine: [102, 205, 170, 1], mediumblue: [0, 0, 205, 1], mediumorchid: [186, 85, 211, 1], mediumpurple: [147, 112, 219, 1], mediumseagreen: [60, 179, 113, 1], mediumslateblue: [123, 104, 238, 1], mediumspringgreen: [0, 250, 154, 1], mediumturquoise: [72, 209, 204, 1], mediumvioletred: [199, 21, 133, 1], midnightblue: [25, 25, 112, 1], mintcream: [245, 255, 250, 1], mistyrose: [255, 228, 225, 1], moccasin: [255, 228, 181, 1], navajowhite: [255, 222, 173, 1], navy: [0, 0, 128, 1], oldlace: [253, 245, 230, 1], olive: [128, 128, 0, 1], olivedrab: [107, 142, 35, 1], orange: [255, 165, 0, 1], orangered: [255, 69, 0, 1], orchid: [218, 112, 214, 1], palegoldenrod: [238, 232, 170, 1], palegreen: [152, 251, 152, 1], paleturquoise: [175, 238, 238, 1], palevioletred: [219, 112, 147, 1], papayawhip: [255, 239, 213, 1], peachpuff: [255, 218, 185, 1], peru: [205, 133, 63, 1], pink: [255, 192, 203, 1], plum: [221, 160, 221, 1], powderblue: [176, 224, 230, 1], purple: [128, 0, 128, 1], red: [255, 0, 0, 1], rosybrown: [188, 143, 143, 1], royalblue: [65, 105, 225, 1], saddlebrown: [139, 69, 19, 1], salmon: [250, 128, 114, 1], sandybrown: [244, 164, 96, 1], seagreen: [46, 139, 87, 1], seashell: [255, 245, 238, 1], sienna: [160, 82, 45, 1], silver: [192, 192, 192, 1], skyblue: [135, 206, 235, 1], slateblue: [106, 90, 205, 1], slategray: [112, 128, 144, 1], slategrey: [112, 128, 144, 1], snow: [255, 250, 250, 1], springgreen: [0, 255, 127, 1], steelblue: [70, 130, 180, 1], tan: [210, 180, 140, 1], teal: [0, 128, 128, 1], thistle: [216, 191, 216, 1], tomato: [255, 99, 71, 1], turquoise: [64, 224, 208, 1], violet: [238, 130, 238, 1], wheat: [245, 222, 179, 1], white: [255, 255, 255, 1], whitesmoke: [245, 245, 245, 1], yellow: [255, 255, 0, 1], yellowgreen: [154, 205, 50, 1]};
        return Z
    })();
    var P;
    P = (function() {
        var ab, aa;
        ab = (function() {
            function ac() {
            }
            ac.prototype.forceLinkList = null;
            ac.prototype.x = 0;
            ac.prototype.y = 0;
            ac.prototype.r = 0;
            ac.prototype.fx = 0;
            ac.prototype.fy = 0;
            ac.prototype.sizeEstimate = 0;
            ac.prototype.left = null;
            ac.prototype.right = null;
            ac.prototype.nodes = null;
            return ac
        })();
        Z.prototype.maxLeafCount = 5;
        Z.test = function() {
            var ae, ac, ad;
            ad = new Z();
            ad.maxLeafCount = 2;
            ad.temperature = 1;
            ac = [];
            ae = {z: 0, dx: 0, dy: 0, dz: 0, repulsiveForceX: 0, repulsiveForceY: 0, repulsiveForceZ: 0, fsum: 0};
            ac.push(Q.extend({r: 5, x: 10, y: 10}, ae));
            ac.push(Q.extend({r: 5, x: 0, y: 0}, ae));
            ac.push(Q.extend({r: 5, x: 0, y: 10}, ae));
            ac.push(Q.extend({r: 5, x: 10, y: 0}, ae));
            ac.push(Q.extend({r: 5, x: 10, y: 10}, ae));
            ac.push(Q.extend({r: 5, x: 20, y: 0}, ae));
            ac.push(Q.extend({r: 5, x: 25, y: 0}, ae));
            return ad.buildTree(ac, ac.length)
        };
        function Z() {
            this.root = null;
            this.freeNodeRoot = null;
            this.temperature = 0;
            this.nodeCount = 0
        }
        Z.prototype.buildTree = function(ae) {
            var ad, ac, ag, af;
            this.iters = 0;
            ad = ae.length;
            if (this.root != null) {
                this.freeNode(this.root)
            }
            this.root = this.newNode();
            if (ad > 0) {
                this.buildTreeRecursive(ae, 0, ad, this.root)
            }
            for (ac = ag = 0, af = ad - 1; ag <= af; ac = ag += 1) {
                ae[ac].repulsiveForceX = 0;
                ae[ac].repulsiveForceY = 0;
                ae[ac].repulsiveForceZ = 0
            }
            return this.calculateForces()
        };
        Z.prototype.freeNode = function(ac) {
            if (ac.left != null) {
                this.freeNode(ac.left)
            }
            if (ac.right != null) {
                this.freeNode(ac.right)
            }
            ac.left = this.freeNodeRoot;
            return this.freeNodeRoot = ac
        };
        Z.prototype.newNode = function() {
            var ac;
            if (this.freeNodeRoot != null) {
                ac = this.freeNodeRoot;
                this.freeNodeRoot = ac.left;
                ac.left = null;
                ac.right = null;
                ac.leafCount = 0;
                ac.sizeEstimate = 0;
                ac.forceLinkList.length = 0
            } else {
                ac = new ab();
                ac.forceLinkList = [];
                ac.leaves = new Array(this.maxLeafCount)
            }
            ac.repulsiveForceX = 0;
            ac.repulsiveForceY = 0;
            ac.repulsiveForceZ = 0;
            return ac
        };
        aa = function(ad, ae, ac) {
            var af;
            af = ad[ae];
            ad[ae] = ad[ac];
            return ad[ac] = af
        };
        Z.prototype.addForceLink = function(ac, ad) {
            return ac.forceLinkList.push(ad)
        };
        Z.prototype.getMedianX = function(ad, ac, ai) {
            var ag, aj, ah, ae, af;
            ai -= 1;
            ah = ((ac + ai) / 2) | 0;
            while (true) {
                if (ai <= ac) {
                    return ah
                }
                if (ai === ac + 1) {
                    if (ad[ac].x > ad[ai].x) {
                        aa(ad, ac, ai);
                        return ah
                    }
                }
                ae = ((ac + ai) / 2) | 0;
                if (ad[ae].x > ad[ai].x) {
                    aa(ad, ae, ai)
                }
                if (ad[ac].x > ad[ai].x) {
                    aa(ad, ac, ai)
                }
                if (ad[ae].x > ad[ac].x) {
                    aa(ad, ae, ac)
                }
                aa(ad, ae, ac + 1);
                aj = ac + 1;
                ag = ai;
                while (true) {
                    while (true) {
                        aj += 1;
                        if (!(ad[ac].x > ad[aj].x)) {
                            break
                        }
                    }
                    while (true) {
                        ag -= 1;
                        if (!(ad[ag].x > ad[ac].x)) {
                            break
                        }
                    }
                    if (ag < aj) {
                        break
                    }
                    af = ad[aj];
                    ad[aj] = ad[ag];
                    ad[ag] = af
                }
                aa(ad, ac, ag);
                if (ag <= ah) {
                    ac = aj
                }
                if (ag >= ah) {
                    ai = ag - 1
                }
            }
        };
        Z.prototype.getMedianY = function(ad, ac, ai) {
            var ag, aj, ah, ae, af;
            ai -= 1;
            ah = ((ac + ai) / 2) | 0;
            while (true) {
                if (ai <= ac) {
                    return ah
                }
                if (ai === ac + 1) {
                    if (ad[ac].y > ad[ai].y) {
                        aa(ad, ac, ai)
                    }
                    return ah
                }
                ae = ((ac + ai) / 2) | 0;
                if (ad[ae].y > ad[ai].y) {
                    aa(ad, ae, ai)
                }
                if (ad[ac].y > ad[ai].y) {
                    aa(ad, ac, ai)
                }
                if (ad[ae].y > ad[ac].y) {
                    aa(ad, ae, ac)
                }
                aa(ad, ae, ac + 1);
                aj = ac + 1;
                ag = ai;
                while (true) {
                    while (true) {
                        aj += 1;
                        if (!(ad[ac].y > ad[aj].y)) {
                            break
                        }
                    }
                    while (true) {
                        ag -= 1;
                        if (!(ad[ag].y > ad[ac].y)) {
                            break
                        }
                    }
                    if (ag < aj) {
                        break
                    }
                    af = ad[aj];
                    ad[aj] = ad[ag];
                    ad[ag] = af
                }
                aa(ad, ac, ag);
                if (ag <= ah) {
                    ac = aj
                }
                if (ag >= ah) {
                    ai = ag - 1
                }
            }
        };
        Z.prototype.buildTreeRecursive = function(ay, ak, aj, aA) {
            var al, am, aw, ac, an, av, au, at, ar, az, ax, aq, ai, ag, ao, ae, ad, ap, ah, af;
            az = ax = ay[ak].x;
            ai = ag = ay[ak].y;
            for (aw = ae = ap = ak + 1, ah = aj - 1; ae <= ah; aw = ae += 1) {
                au = ay[aw];
                ar = au.x;
                aq = au.y;
                if (ar < az) {
                    az = ar
                }
                if (ar > ax) {
                    ax = ar
                }
                if (aq < ai) {
                    ai = aq
                }
                if (aq > ag) {
                    ag = aq
                }
            }
            aA.sizeEstimate = Math.max(ax - az, ag - ai);
            aA.sizeEstimate = aA.sizeEstimate * aA.sizeEstimate + 0.1;
            aA.sizeEstimate *= 2;
            am = aj - ak;
            if (am <= this.maxLeafCount) {
                aA.leafCount = am;
                ar = 0;
                aq = 0;
                ao = 0;
                at = 0;
                for (aw = ad = 0, af = am - 1; ad <= af; aw = ad += 1) {
                    av = ay[aw + ak];
                    ar += av.x;
                    aq += av.y;
                    ao += av.z;
                    at += av.r;
                    aA.leaves[aw] = av
                }
                ac = 1 / am;
                aA.r = at;
                aA.x = ar * ac;
                aA.y = aq * ac;
                aA.z = ao * ac;
                return
            }
            if (ax - az > ag - ai) {
                an = this.getMedianX(ay, ak, aj)
            } else {
                an = this.getMedianY(ay, ak, aj)
            }
            an++;
            al = this.newNode();
            aA.left = al;
            this.buildTreeRecursive(ay, ak, an, al);
            al = this.newNode();
            aA.right = al;
            this.buildTreeRecursive(ay, an, aj, al);
            ac = 1 / am;
            aA.r = aA.right.r + aA.left.r;
            aA.x = (aA.left.x * (an - ak) + aA.right.x * (aj - an)) * ac;
            aA.y = (aA.left.y * (an - ak) + aA.right.y * (aj - an)) * ac;
            return aA.z = (aA.left.z * (an - ak) + aA.right.z * (aj - an)) * ac
        };
        Z.prototype.calculateForces = function() {
            var ao, ak, aj, au, al, ar, ap, ad, ac, aq, an, at, ag, ae, am, ai, ah, af;
            aq = new Array(this.nodeCount);
            at = 0;
            an = 0;
            if (this.root.left !== null) {
                aq[an] = this.root.left;
                an++;
                aq[an] = this.root.right;
                an++;
                this.addForceLink(this.root.left, this.root.right)
            } else {
                aq[an] = this.root;
                an++
            }
            af = [];
            while (at < an) {
                ap = aq[at];
                at++;
                al = 1 / ap.r;
                if (ap.left !== null) {
                    this.processTreeNode(ap, ap.left);
                    this.processTreeNode(ap, ap.right);
                    aq[an] = ap.left;
                    an++;
                    aq[an] = ap.right;
                    an++;
                    ao = ap.left.r * al;
                    ak = ap.repulsiveForceX * ao;
                    aj = ap.repulsiveForceY * ao;
                    ap.left.repulsiveForceX += ak;
                    ap.left.repulsiveForceY += aj;
                    ap.right.repulsiveForceX += ap.repulsiveForceX - ak;
                    ap.right.repulsiveForceY += ap.repulsiveForceY - aj;
                    this.addForceLink(ap.left, ap.right)
                } else {
                    for (au = ag = 0, am = ap.leafCount - 1; ag <= am; au = ag += 1) {
                        ad = ap.leaves[au];
                        this.processLeafNode(ap, ad);
                        ao = ad.r * al;
                        ad.repulsiveForceX += ap.repulsiveForceX * ao;
                        ad.repulsiveForceY += ap.repulsiveForceY * ao;
                        for (ar = ae = ai = au + 1, ah = ap.leafCount - 1; ae <= ah; ar = ae += 1) {
                            ac = ap.leaves[ar];
                            this.forceBetweenParticles(ad, ac)
                        }
                    }
                }
                af.push(ap.forceLinkList.length = 0)
            }
            return af
        };
        Z.prototype.processTreeNode = function(ad, aq) {
            var af, ae, ak, am, ac, ai, al, ao, an, ap, ah, aj, ag;
            ac = ad.forceLinkList.length;
            ag = [];
            for (ak = ah = 0, aj = ac - 1; ah <= aj; ak = ah += 1) {
                ai = ad.forceLinkList[ak];
                ao = aq.x - ai.x;
                an = aq.y - ai.y;
                am = ao * ao + an * an;
                al = aq.sizeEstimate;
                if (ai instanceof ab) {
                    al += ai.sizeEstimate
                }
                if (al < am) {
                    ap = aq.r * ai.r / (am * Math.sqrt(am));
                    af = ao * ap;
                    aq.repulsiveForceX += af;
                    ai.repulsiveForceX -= af;
                    ae = an * ap;
                    aq.repulsiveForceY += ae;
                    ag.push(ai.repulsiveForceY -= ae)
                } else {
                    if (ai instanceof ab) {
                        ag.push(this.addForceLink(ai, aq))
                    } else {
                        ag.push(this.addForceLink(aq, ai))
                    }
                }
            }
            return ag
        };
        Z.prototype.processLeafNode = function(ac, ap) {
            var ae, ad, ak, ah, aj, am, al, ao, ag, an, ai, af;
            ai = ac.forceLinkList;
            af = [];
            for (ag = 0, an = ai.length; ag < an; ag++) {
                ah = ai[ag];
                if (!(ah instanceof ab)) {
                    af.push(this.forceBetweenParticles(ap, ah))
                } else {
                    am = ap.x - ah.x;
                    al = ap.y - ah.y;
                    ak = am * am + al * al;
                    aj = ah.sizeEstimate;
                    if (aj < ak) {
                        ao = ap.r * ah.r / (ak * Math.sqrt(ak));
                        ae = am * ao;
                        ap.repulsiveForceX += ae;
                        ah.repulsiveForceX -= ae;
                        ad = al * ao;
                        ap.repulsiveForceY += ad;
                        af.push(ah.repulsiveForceY -= ad)
                    } else {
                        af.push(this.addForceLink(ah, ap))
                    }
                }
            }
            return af
        };
        Z.prototype.forceBetweenParticles = function(ae, ad) {
            var af, ai, ag, ah, aj, ac;
            ag = ae.x - ad.x;
            ah = ae.y - ad.y;
            aj = ae.z - ad.z;
            af = ag * ag + ah * ah + aj * aj;
            ai = ae.r + ad.r;
            if (af * this.temperature < ai) {
                ac = 0.25 * this.temperature * Math.sqrt(this.temperature * ai)
            } else {
                ac = 0.25 * ai * ai / (af * Math.sqrt(af))
            }
            ae.repulsiveForceX += ag * ac;
            ad.repulsiveForceX -= ag * ac;
            ae.repulsiveForceY += ah * ac;
            ad.repulsiveForceY -= ah * ac;
            ae.repulsiveForceZ += aj * ac;
            return ad.repulsiveForceZ -= aj * ac
        };
        return Z
    })();
    var n;
    n = (function() {
        function Z(ab, aa) {
            var ac, ae, ad;
            this.edgecnt = 0;
            this.nodecnt = ab;
            this.maxedges = aa;
            this.increment = aa + 1;
            this.nodestart = new Array(ab);
            this.enodes = new Array(aa);
            this.next = new Array(aa);
            for (ac = ae = 0, ad = this.nodecnt - 1; ae <= ad; ac = ae += 1) {
                this.nodestart[ac] = -1
            }
        }
        Z.prototype.addEdge = function(aa, ab) {
            if (this.edgecnt >= this.maxedges) {
                this.maxedges += this.increment;
                this.increment *= 2;
                this.next.length = this.maxedges;
                this.enodes.length = this.maxedges
            }
            this.enodes[this.edgecnt] = ab;
            this.next[this.edgecnt] = this.nodestart[aa];
            this.nodestart[aa] = this.edgecnt;
            return this.edgecnt++
        };
        Z.prototype.addUndirectEdge = function(aa, ab) {
            this.addEdge(aa, ab);
            return this.addEdge(ab, aa)
        };
        return Z
    })();
    var U;
    U = (function() {
        function Z() {
        }
        Z.themes = {};
        Z.prototype.customize = function(aa) {
            if (!this.themes.hasOwnProperty(aa)) {
                throw"No customization named " + aa
            }
            return this.updateSettings(this.themes[aa])
        };
        Z.prototype.saveState = function() {
            return this._impl.save()
        };
        Z.prototype.restoreState = function(ab, aa) {
            if (aa == null) {
                aa = false
            }
            return this._impl.restore(ab, aa)
        };
        Z.prototype.updateSettings = function(aa) {
            this._impl.updateSettings(aa, "api");
            return this
        };
        Z.prototype.on = function(aa, ab) {
            return this._impl.on(aa, ab)
        };
        Z.prototype.off = function(aa, ab) {
            return this._impl.off(aa, ab)
        };
        Z.prototype.updateSize = function() {
            this._impl.updateSize();
            return this
        };
        Z.prototype.reloadData = function() {
            return this._impl.reloadData()
        };
        Z.prototype.remove = function() {
            return this._impl.remove()
        };
        Z.prototype.saveAsImage = function(aa, ab, ac) {
            return this._impl.events.exportToImage(aa, ab, ac)
        };
        Z.prototype["export"] = function(aa, ab, ac) {
            return D["export"](this, {type: aa, dimensions: ab, transparent: ac})
        };
        Z.prototype.exportGetDimensions = function(aa) {
            return this._impl.events.exportGetDimensions(aa)
        };
        return Z
    })();
    var x;
    x = (function() {
        function Z() {
        }
        Z.stroke = function(ab, aa) {
            if (aa.lineWidth) {
                ab.lineWidth = aa.lineWidth
            }
            ab.strokeStyle = aa.lineColor;
            ab.stroke();
            if (aa.lineWidth) {
                return ab.lineWidth = 1
            }
        };
        Z.fill = function(ab, aa) {
            if (!aa.fillColor) {
                return
            }
            ab.fillStyle = aa.fillColor;
            if (aa.shadowColor) {
                ab.shadowOffsetX = aa.shadowOffsetX;
                ab.shadowOffsetY = aa.shadowOffsetY;
                ab.shadowBlur = aa.shadowBlur;
                ab.shadowColor = aa.shadowColor
            }
            ab.fill();
            if (aa.shadowColor) {
                ab.shadowBlur = 0;
                return ab.shadowColor = null
            }
        };
        Z.paint = function(ab, aa) {
            if (aa.shadowColor) {
                ab.shadowOffsetX = aa.shadowOffsetX;
                ab.shadowOffsetY = aa.shadowOffsetY;
                ab.shadowBlur = aa.shadowBlur;
                ab.shadowColor = aa.shadowColor
            }
            if (aa.lineColor) {
                ab.lineWidth = aa.lineWidth ? aa.lineWidth : 1;
                ab.strokeStyle = aa.lineColor;
                ab.stroke()
            }
            if (aa.fillColor) {
                ab.fillStyle = aa.fillColor;
                ab.fill()
            }
            if (aa.shadowColor) {
                ab.shadowOffsetX = 0;
                ab.shadowOffsetY = 0;
                ab.shadowBlur = 0;
                return ab.shadowColor = null
            }
        };
        Z.textStyle = function(ab, aa) {
            if (aa.fillColor) {
                ab.fillStyle = aa.fillColor
            }
            if (aa.font) {
                ab.font = aa.font
            }
            if (aa.shadowColor) {
                ab.shadowOffsetX = aa.shadowOffsetX;
                ab.shadowOffsetY = aa.shadowOffsetY;
                ab.shadowBlur = aa.shadowBlur;
                return ab.shadowColor = aa.shadowColor
            }
        };
        Z.rectStyle = function(ab, aa) {
            if (aa.hasOwnProperty("lineColor")) {
                ab.strokeStyle = aa.lineColor
            }
            if (aa.hasOwnProperty("fillColor")) {
                return ab.fillStyle = aa.fillColor
            }
        };
        Z.pushClip = function(ad, aa, ae, ab, ac) {
            ad.save();
            ad.beginPath();
            ad.rect(aa, ae, ab, ac);
            return ad.clip()
        };
        Z.popClip = function(aa) {
            return aa.restore()
        };
        Z.arcBetweenTwoPoints = function(aq, ag, af, al, at, ad, ar, ac) {
            var aw, av, am, au, ay, ax, ap, ae, aj, ah, ak, ai, ao, an, ab, aa;
            aj = (at + ar) / 2;
            ah = (ad + ac) / 2;
            ak = ac - ad;
            ai = at - ar;
            ae = ak * ak + ai * ai;
            if (ae === 0) {
                return
            }
            ap = Math.sqrt(ae);
            al = Math.min(Math.max(al, ap / 2), ap * 3);
            au = Math.sqrt(al * al / ae - 0.25);
            ao = aj + ak * au;
            ab = ah + ai * au;
            an = aj - ak * au;
            aa = ah - ai * au;
            ay = (ao - ag) * (ao - ag) + (ab - af) * (ab - af);
            ax = (an - ag) * (an - ag) + (aa - af) * (aa - af);
            if (ay > ax) {
                ag = an;
                af = aa
            } else {
                ag = ao;
                af = ab
            }
            aw = Math.atan2(ad - af, at - ag);
            av = Math.atan2(ac - af, ar - ag);
            if (av < aw) {
                av += Math.PI * 2
            }
            am = Math.abs(aw - av) > Math.PI;
            return aq.arc(ag, af, al, aw, av, am)
        };
        Z.strokeMarker = function(ae, ab, aa, af, ad) {
            var ac;
            ac = ad * 1.41421356237;
            if (ab === "rect") {
                ae.moveTo(aa - ad, af - ad);
                ae.lineTo(aa + ad, af - ad);
                ae.lineTo(aa + ad, af + ad);
                ae.lineTo(aa - ad, af + ad);
                return ae.closePath()
            } else {
                if (ab === "romb") {
                    ae.moveTo(aa - ac, af);
                    ae.lineTo(aa, af - ac);
                    ae.lineTo(aa + ac, af);
                    ae.lineTo(aa, af + ac);
                    ae.closePath();
                    return ae.fill()
                } else {
                    if (ab === "triangle") {
                        ae.beginPath();
                        ae.moveTo(aa - ac, af + ac);
                        ae.lineTo(aa + ac, af + ac);
                        ae.lineTo(aa, af - ac);
                        ae.closePath();
                        return ae.fill()
                    } else {
                        if (ab === "triangle2") {
                            ae.beginPath();
                            ae.run(aa - ac, af - ac);
                            ae.lineTo(aa + ac, af - ac);
                            ae.lineTo(aa, af + ac);
                            ae.closePath();
                            return ae.fill()
                        } else {
                            if (ab === "circle") {
                                ae.beginPath();
                                ae.arc(aa, af, ad, 0, Math.PI * 2, true);
                                return ae.closePath()
                            } else {
                                throw"unknown marker shape " + ab
                            }
                        }
                    }
                }
            }
        };
        Z.strokeBalloon = function(ae, ab, ah, ai, ad) {
            var ac, aa, aj, ag, af;
            ai = Math.max(ai, ad * 2);
            ac = 5;
            aj = 4;
            aa = (ad + aj * 2) / 2;
            ag = ab;
            af = ah;
            ae.moveTo(ag, af);
            ag += ac;
            af += ac;
            ae.lineTo(ag, af);
            ag += ai / 2 - aj - ac;
            ae.lineTo(ag, af);
            ae.arc(ag, af + aa, aa, -Math.PI / 2, Math.PI / 2);
            af += aa * 2;
            ag -= ai - 2 * aj;
            ae.lineTo(ag, af);
            ae.arc(ag, af - aa, aa, Math.PI * 0.5, Math.PI * 1.5);
            af -= aa * 2;
            ag += ai / 2 - aj - ac;
            ae.lineTo(ag, af);
            ag += ac;
            af -= ac;
            ae.closePath();
            return ah + ac + aa
        };
        Z.strokeBalloon2 = function(ad, ab, ag, ah, ac) {
            var aa, ai, af, ae;
            ai = 4;
            aa = (ac + ai * 2) / 2;
            ah = Math.max(ah, ac * 2) / 2 - ai;
            af = ab + ah;
            ae = ag - aa;
            ad.moveTo(af, ae);
            ad.arc(af, ae + aa, aa, -Math.PI / 2, Math.PI / 2, false);
            ae += aa * 2;
            af -= ah * 2;
            ad.lineTo(af, ae);
            ad.arc(af, ae - aa, aa, Math.PI * 0.5, Math.PI * 1.5, false);
            return ad.closePath()
        };
        Z.applyColorToImage = function(ak, am, aa) {
            var at, ar, aq, af, au, ap, al, ao, an, aj, ah, ai, ac, ab, ag, ae, ad;
            if (aa == null) {
                aa = true
            }
            ag = Z.parseColor(am), aj = ag[0], ap = ag[1], ar = ag[2], at = ag[3];
            aq = document.createElement("canvas");
            ai = aq.width = ak.width;
            ao = aq.height = ak.height;
            al = aq.getContext("2d");
            al.drawImage(ak, 0, 0);
            af = al.getImageData(0, 0, ai, ao);
            au = af.data;
            if (aa) {
                for (an = ac = 0, ae = au.length; ac <= ae; an = ac += 4) {
                    if (au[an + 3] !== 255) {
                        continue
                    }
                    au[an] = (au[an] * aj) >> 8;
                    au[an + 1] = (au[an + 1] * ap) >> 8;
                    au[an + 2] = (au[an + 2] * ar) >> 8
                }
            } else {
                for (an = ab = 0, ad = au.length; ab <= ad; an = ab += 4) {
                    au[an] = (au[an] * aj) >> 8;
                    au[an + 1] = (au[an + 1] * ap) >> 8;
                    au[an + 2] = (au[an + 2] * ar) >> 8
                }
            }
            al.putImageData(af, 0, 0);
            ah = new Image();
            ah.src = aq.toDataURL("image/png");
            return ah
        };
        Z.parseColor = function(aa) {
            return j.parseCSSColor(aa)
        };
        Z.normalizeColor = function(ac) {
            var ab, aa, ae, ad, af;
            af = j.parseCSSColor(ac), ad = af[0], ae = af[1], aa = af[2], ab = af[3];
            return"rgba(" + ad + "," + ae + "," + aa + "," + (ab.toFixed(3)) + ")"
        };
        Z.deriveColor = function(ac, ae, ad) {
            var ab, aa, ag, af, ah;
            ah = Z.parseColor(ac), af = ah[0], ag = ah[1], aa = ah[2], ab = ah[3];
            return this.deriveColorRGBA(af, ag, aa, ab, ae, ad)
        };
        Z.deriveColorRGBA = function(ag, af, aa, ac, ae, ad) {
            var ab;
            ab = (ae - 1) * 255;
            ag = Math.round(Math.min(255, Math.max(0, ag + ab)));
            af = Math.round(Math.min(255, Math.max(0, af + ab)));
            aa = Math.round(Math.min(255, Math.max(0, aa + ab)));
            ac = Math.min(1, ac * ad);
            return"rgba(" + ag + "," + af + "," + aa + "," + (ac.toFixed(3)) + ")"
        };
        Z.blendColors = function(al, ak, aj) {
            var ap, ae, ad, an, aq, ao, am, ac, ab, aa, ag, af, ai, ah;
            ai = Z.parseColor(al), ag = ai[0], ac = ai[1], aq = ai[2], ae = ai[3];
            ah = Z.parseColor(ak), af = ah[0], ab = ah[1], ao = ah[2], ad = ah[3];
            aa = Math.round(af * aj + ag * (1 - aj));
            am = Math.round(ab * aj + ac * (1 - aj));
            an = Math.round(ao * aj + aq * (1 - aj));
            ap = ad * aj + ae * (1 - aj);
            return"rgba(" + aa + "," + am + "," + an + "," + (ap.toFixed(3)) + ")"
        };
        Z.copyHue = function(ad, an) {
            var am, ar, ap, al, af, ae, aq, ao, ak, ab, aa, ah, aj, ai, ag, ac;
            ag = Z.parseColor(ad), aj = ag[0], ab = ag[1], af = ag[2], ar = ag[3];
            ac = Z.parseColor(an), ai = ac[0], aa = ac[1], ae = ac[2], ap = ac[3];
            aq = (aj + ab + af) / 765;
            ao = (ai + aa + ae) / 765;
            ah = Math.round(aj / aq * ao);
            ak = Math.round(ab / aq * ao);
            al = Math.round(af / aq * ao);
            am = ap;
            return"rgba(" + ah + "," + ak + "," + al + "," + (am.toFixed(3)) + ")"
        };
        Z.inverseColor = function(ae) {
            var ab, aa, ad, ac, af;
            af = Z.parseColor(ae), ac = af[0], ad = af[1], aa = af[2], ab = af[3];
            ac = 255 - ac;
            ad = 255 - ad;
            aa = 255 - aa;
            return"rgba(" + ac + "," + ad + "," + aa + "," + (ab.toFixed(3)) + ")"
        };
        Z.applyShadow = function(ab, aa) {
            if (aa.shadowColor) {
                ab.shadowOffsetX = aa.shadowOffsetX;
                ab.shadowOffsetY = aa.shadowOffsetY;
                ab.shadowBlur = aa.shadowBlur;
                return ab.shadowColor = aa.shadowColor
            }
        };
        Z.clearShadow = function(aa) {
            aa.shadowOffsetX = 0;
            aa.shadowOffsetY = 0;
            aa.shadowBlur = 0;
            return aa.shadowColor = ""
        };
        return Z
    })();
    var H;
    H = (function() {
        var ab, aa;
        ab = (function() {
            function ac() {
            }
            ac.prototype.to = null;
            ac.prototype.K = 0;
            ac.prototype.len = 0;
            ac.prototype.strength = 0;
            return ac
        })();
        aa = (function() {
            function ac() {
            }
            ac.prototype.x = 0;
            ac.prototype.y = 0;
            ac.prototype.z = 0;
            ac.prototype.r = 1;
            ac.prototype.zattr = 1;
            ac.prototype.repulsiveForceX = 0;
            ac.prototype.repulsiveForceY = 0;
            ac.prototype.repulsiveForceZ = 0;
            ac.prototype.fsum = 0;
            ac.prototype.edges = [];
            return ac
        })();
        Z.prototype.temperature = 0;
        Z.prototype.unitTemperature = 0;
        Z.prototype.randomLayoutRadius = 0;
        Z.prototype.repulsiveForceTree = null;
        Z.prototype.randomGenerator = null;
        Z.prototype.nodePermutation = null;
        Z.prototype.nodeRepulsionFactor = 15;
        Z.prototype.componentCenterFactor = 0.005;
        Z.prototype.linkForceFactor = 0.2;
        Z.prototype.zAxisAttraction = 1;
        Z.prototype.nodeDegreeModifier = 1.2;
        Z.prototype.forceReductionFactor = 1;
        Z.prototype.globalForceX = 0;
        Z.prototype.globalForceY = 0;
        Z.prototype.centerX = 0;
        Z.prototype.centerY = 0;
        Z.prototype.aspectRatio = null;
        function Z(ac) {
            this.random = ac;
            this.nodeCount = 0;
            this.nodes = [];
            this.forceX = [];
            this.forceY = [];
            this.forceZ = [];
            this.forceSum = [];
            this.oldForceX = [];
            this.oldForceY = [];
            this.oldForceZ = [];
            this.componentX = [];
            this.componentY = [];
            this.componentSum = [];
            this.componentNodeCount = [];
            this.nodePermutation = [];
            this.idToIndex = {};
            this.repulsiveForceTree = new P()
        }
        Z.prototype.updateParams = function(ae, ac, ad) {
            this.spacing = ae;
            this.nodeDegreeModifier = ac;
            this.aspectRatio = ad
        };
        Z.prototype.updateGraph = function(aH, aG, ae) {
            var aA, aE, aV, av, an, aF, aW, aw, az, aY, af, aN, aX, aD, aC, aB, ad, ac, ar, ap, ao, aU, aJ, ax, aZ, ai, aP, aI, aT, aS, aR, aQ, ay, am, al, ak, aj, ah, ag, aO, aM, aL, aK, au, at, aq;
            ae |= aH.length !== this.nodeCount;
            if (ae) {
                ac = this.nodes;
                ar = this.oldForceX;
                ap = this.oldForceY;
                ao = this.oldForceZ;
                aC = this.idToIndex;
                this.nodeCount = aH.length;
                this.oldForceX = new Array(this.nodeCount);
                this.oldForceY = new Array(this.nodeCount);
                this.oldForceZ = new Array(this.nodeCount);
                this.forceX = new Array(this.nodeCount);
                this.forceY = new Array(this.nodeCount);
                this.forceZ = new Array(this.nodeCount);
                this.forceSum = new Array(this.nodeCount);
                this.nodes = new Array(this.nodeCount);
                this.idToIndex = {};
                for (aW = aT = 0, ay = aH.length; aT < ay; aW = ++aT) {
                    aN = aH[aW];
                    aF = aN.id;
                    aD = new aa();
                    aD.edges = [];
                    this.idToIndex[aF] = aW;
                    this.nodes[aW] = aD;
                    if (aC.hasOwnProperty(aF)) {
                        aB = aC[aF];
                        ad = ac[aB];
                        aD.z = ad.z;
                        this.oldForceX[aW] = ar[aB];
                        this.oldForceY[aW] = ap[aB];
                        this.oldForceZ[aW] = ao[aB]
                    } else {
                        this.oldForceX[aW] = 0;
                        this.oldForceY[aW] = 0;
                        this.oldForceZ[aW] = 0
                    }
                }
                this.nodePermutation = this.nodes.slice(0)
            }
            for (aW = aS = 0, am = aH.length; aS < am; aW = ++aS) {
                aN = aH[aW];
                aX = this.nodes[aW];
                aX.x = aN.x;
                aX.y = aN.y;
                aX.r = Math.max(1, aN.currentRadius);
                aX.zattr = aN.visibility;
                aX.edges.length = 0;
                aX.locked = aN.locked;
                this.forceX[aW] = 0;
                this.forceY[aW] = 0;
                this.forceZ[aW] = 0;
                this.forceSum[aW] = 0
            }
            for (aR = 0, al = aG.length; aR < al; aR++) {
                af = aG[aR];
                aJ = af.strength;
                az = af.length;
                aP = af.visibility;
                av = this.nodes[this.idToIndex[af.from.id]];
                aZ = this.nodes[this.idToIndex[af.to.id]];
                if (!av || !aZ) {
                    console.log("Layout: missing node for link: " + af.from.id + " " + af.to.id + ", topology = " + ae);
                    continue
                }
                if (av === aZ) {
                    continue
                }
                av.edges.push({to: aZ, strength: aJ, len: az, vis: aP});
                aZ.edges.push({to: av, strength: aJ, len: az, vis: aP})
            }
            if (ae) {
                this.computeComponents()
            }
            aK = this.nodes;
            for (aQ = 0, ak = aK.length; aQ < ak; aQ++) {
                aN = aK[aQ];
                ax = 0;
                au = aN.edges;
                for (aO = 0, aj = au.length; aO < aj; aO++) {
                    aV = au[aO];
                    ax += aV.to.edges.length * aV.vis
                }
                aI = Math.sqrt(ax);
                aN.r += this.spacing;
                if (aI > 4) {
                    aN.r += (aI - 4) * aN.r / 4 * this.nodeDegreeModifier
                }
            }
            aw = 0;
            aU = 0;
            at = this.nodes;
            for (aM = 0, ah = at.length; aM < ah; aM++) {
                aN = at[aM];
                an = 0;
                aq = aN.edges;
                for (aL = 0, ag = aq.length; aL < ag; aL++) {
                    aV = aq[aL];
                    ai = aV.to;
                    if (aN.locked && ai.locked || (aN === ai)) {
                        continue
                    }
                    aU++;
                    aA = aN.r + ai.r;
                    aY = aV.len;
                    aE = Math.min(20, aV.strength);
                    aV.len = Math.max(1, aA * aY);
                    aV.K = aE * 30 / aV.len;
                    an += aV.K;
                    aw += aV.len
                }
                aN.fsum = an
            }
            this.randomLayoutRadius = Math.max(1, aw / 10);
            return this.unitTemperature = aw / aU / 30
        };
        Z.prototype.computeComponents = function() {
            var aq, at, ap, ak, ao, af, an, ae, al, aj, ah, ar, ad, ac, am, ai, ag;
            this.componentX = [];
            this.componentY = [];
            this.componentSum = [];
            this.componentNodeCount = [];
            an = new Array(this.nodeCount);
            am = this.nodes;
            for (al = 0, ar = am.length; al < ar; al++) {
                af = am[al];
                af.component = -1
            }
            aq = 0;
            ai = this.nodes;
            for (aj = 0, ad = ai.length; aj < ad; aj++) {
                af = ai[aj];
                if (af.component >= 0) {
                    continue
                }
                af.component = aq;
                at = 0;
                ae = 0;
                ak = 0;
                an[ak] = af;
                ak += 1;
                while (ae < ak) {
                    af = an[ae];
                    ae += 1;
                    at += 1;
                    ag = af.edges;
                    for (ah = 0, ac = ag.length; ah < ac; ah++) {
                        ap = ag[ah];
                        ao = ap.to;
                        if (ao.component === -1) {
                            ao.component = aq;
                            an[ak] = ao;
                            ak += 1
                        }
                    }
                }
                this.componentNodeCount.push(at);
                this.componentX.push(0);
                this.componentY.push(0);
                this.componentSum.push(0);
                aq += 1
            }
        };
        Z.prototype.updateComponents = function() {
            var ak, ac, ai, ag, ae, al, aj, ah, ad, af;
            for (ak = ai = 0, aj = this.componentNodeCount.length - 1; ai <= aj; ak = ai += 1) {
                this.componentX[ak] = 0;
                this.componentY[ak] = 0;
                this.componentSum[ak] = 0
            }
            ah = this.nodes;
            for (ag = 0, al = ah.length; ag < al; ag++) {
                ac = ah[ag];
                ak = ac.component;
                this.componentX[ak] += ac.x * ac.r;
                this.componentY[ak] += ac.y * ac.r;
                this.componentSum[ak] += ac.r
            }
            af = [];
            for (ak = ae = 0, ad = this.componentNodeCount.length - 1; ae <= ad; ak = ae += 1) {
                this.componentX[ak] /= this.componentSum[ak];
                af.push(this.componentY[ak] /= this.componentSum[ak])
            }
            return af
        };
        Z.prototype.globalLayout = function(ac, ak, ai) {
            var af, al, ae, an, ad, aj, ag, am, ah;
            if (this.nodeCount <= 0) {
                return
            }
            if (ai) {
                if (this.nodeCount === 1) {
                    ac[0].x = ac[0].y = 0;
                    return
                } else {
                    this.initialRandomLayout()
                }
            }
            an = 0;
            ah = this.nodes;
            for (ag = 0, am = ah.length; ag < am; ag++) {
                ae = ah[ag];
                if (!ae.locked) {
                    an++
                }
            }
            ad = Math.floor(Math.sqrt(an) + 10);
            al = ad * 2;
            this.forceReductionFactor = 1;
            this.temperature = (Math.sqrt(an) * 2 + 20) * this.unitTemperature;
            this.zAxisAttraction = 0.1;
            aj = new Date().getTime();
            af = 3;
            while (this.temperature > this.unitTemperature) {
                if ((al--) <= 0) {
                    al = ad * 3 / (af++);
                    this.temperature = this.temperature / 1.5 - 0.5;
                    if (this.temperature < 20 * this.unitTemperature) {
                        this.zAxisAttraction = this.zAxisAttraction * 1.5 + 0.1
                    }
                }
                this.randomNodePermutation();
                this.repulsiveForceTree.temperature = this.zAxisAttraction / 4;
                this.repulsiveForceTree.buildTree(this.nodePermutation);
                this.moveNodesGlobal();
                if (this.aspectRatio) {
                    this.updateAspectRatio(this.forceReductionFactor * 0.001)
                }
                if (new Date().getTime() > aj + ak) {
                    break
                }
            }
            if (ai) {
                this.centerNodes()
            }
            return this.storeNodes(ac)
        };
        Z.prototype.initialRandomLayout = function() {
            var am, ap, an, ai, ad, aj, ac, ao, ak, ah, ae, aq, al, ag, af;
            ad = this.nodeCount;
            aj = new Array(ad);
            for (an = ak = 0, al = ad - 1; ak <= al; an = ak += 1) {
                aj[an] = an
            }
            for (an = ah = 0; ah <= ad; an = ah += 1) {
                ai = Math.floor(this.random.get() * (ad - an)) + an;
                ao = aj[an];
                aj[an] = aj[ai];
                aj[ai] = ao
            }
            am = this.randomLayoutRadius;
            ap = 2 * Math.PI / this.nodeCount;
            ag = this.nodes;
            af = [];
            for (an = ae = 0, aq = ag.length; ae < aq; an = ++ae) {
                ad = ag[an];
                this.oldForceX[an] = 0;
                this.oldForceY[an] = 0;
                this.oldForceZ[an] = 0;
                ad.z = this.random.get() - 0.5;
                if (!ad.locked) {
                    ac = am + ad.r;
                    ad.x = ac * Math.cos(aj[an] * ap);
                    af.push(ad.y = ac * Math.sin(aj[an] * ap))
                } else {
                    af.push(void 0)
                }
            }
            return af
        };
        Z.prototype.timedLayout = function(ae, ah) {
            var ad, ac, ag, af;
            if (this.nodeCount <= 0) {
                return
            }
            if (this.nodeCount === 1) {
                ae[0].x = 0;
                ae[0].y = 0;
                this.temperature = 0;
                this.unitTemperature = 0;
                return
            }
            ad = 0;
            if (ah < 0.1) {
                ad = 2;
                this.forceReductionFactor = Math.min(this.forceReductionFactor, ah * 10)
            } else {
                ad = Math.min(6, Math.round(2 + ah * 10))
            }
            this.zAxisAttraction = this.nodeRepulsionFactor / 10;
            this.temperature = this.unitTemperature;
            for (ac = ag = 0, af = ad - 1; 0 <= af ? ag <= af : ag >= af; ac = 0 <= af ? ++ag : --ag) {
                this.randomNodePermutation();
                this.repulsiveForceTree.temperature = this.zAxisAttraction / 4;
                this.repulsiveForceTree.buildTree(this.nodePermutation);
                this.moveNodesIncremental();
                if (this.aspectRatio) {
                    this.updateAspectRatio(this.forceReductionFactor)
                }
            }
            return this.storeNodes(ae)
        };
        Z.prototype.moveNodesGlobal = function() {
            var ac, an, ag, af, ad, ak, al, am, ae, ai, aj, ah;
            this.initIteration();
            ae = this.temperature * 0.5;
            ac = this.forceReductionFactor;
            ah = [];
            for (ak = ai = 0, aj = this.nodeCount - 1; ai <= aj; ak = ai += 1) {
                am = this.nodes[ak];
                if (am.locked) {
                    continue
                }
                this.calculateForce(ak, 0.5);
                this.oldForceX[ak] = ag = this.forceX[ak];
                this.oldForceY[ak] = af = this.forceY[ak];
                this.oldForceZ[ak] = ad = this.forceZ[ak];
                an = this.forceSum[ak];
                ag *= an;
                af *= an;
                ad *= an;
                al = ag * ag + af * af + ad * ad;
                if (al < this.temperature * this.temperature && al > 0.001) {
                    al = this.temperature / Math.sqrt(al);
                    ag *= al;
                    af *= al;
                    ad *= al
                }
                am.x += ag * ac + (this.random.get() - 0.5) * ae;
                am.y += af * ac + (this.random.get() - 0.5) * ae;
                ah.push(am.z += ad * ac + (this.random.get() - 0.5) * ae)
            }
            return ah
        };
        Z.prototype.moveNodesIncremental = function() {
            var aw, av, al, aq, ap, ao, ak, aj, at, au, am, ar, ag, ae, ad, ac, an, ai, ah, af;
            this.initIteration();
            for (at = ag = 0, an = this.nodeCount - 1; ag <= an; at = ag += 1) {
                if (!this.nodes[at].locked) {
                    this.calculateForce(at, 0)
                }
            }
            ar = 0;
            au = 0;
            ak = new Array(this.nodeCount);
            for (at = ae = 0, ai = this.nodeCount - 1; ae <= ai; at = ae += 1) {
                if (this.nodes[at].locked) {
                    continue
                }
                aq = this.forceX[at];
                ap = this.forceY[at];
                ao = this.forceZ[at];
                aj = this.forceSum[at];
                al = aq * aq + ap * ap + aq * aq;
                if (al * aj * aj > this.unitTemperature * this.unitTemperature * 0.05 * 0.05) {
                    au += al;
                    ar += this.oldForceX[at] * aq + this.oldForceY[at] * ap + this.oldForceZ[at] * ao
                } else {
                    ak[at] = true
                }
            }
            if (ar > 1e-7) {
                this.forceReductionFactor *= 1 + 0.4 / 1.618033989
            } else {
                if (ar < -1e-7) {
                    this.forceReductionFactor /= 1.4
                }
            }
            aw = this.globalForceX / this.nodeCount;
            av = this.globalForceY / this.nodeCount;
            for (at = ad = 0, ah = this.nodeCount - 1; ad <= ah; at = ad += 1) {
                this.forceX[at] += aw;
                this.forceY[at] += av
            }
            this.forceReductionFactor = Math.min(1, this.forceReductionFactor);
            this.forceReductionFactor = Math.max(0.002, this.forceReductionFactor);
            for (at = ac = 0, af = this.nodeCount - 1; ac <= af; at = ac += 1) {
                am = this.nodes[at];
                if (!am.locked && !ak[at]) {
                    aj = this.forceSum[at] * this.forceReductionFactor;
                    am.x += this.forceX[at] * aj;
                    am.y += this.forceY[at] * aj;
                    am.z += this.forceZ[at] * aj
                }
                this.oldForceX[at] = this.forceX[at];
                this.oldForceY[at] = this.forceY[at];
                this.oldForceZ[at] = this.forceZ[at]
            }
        };
        Z.prototype.initIteration = function() {
            var ac, ai, af, ae, ah, ad, ag;
            ac = 0;
            ai = 0;
            ae = 0;
            ag = this.nodes;
            for (ah = 0, ad = ag.length; ah < ad; ah++) {
                af = ag[ah];
                ae += af.r;
                ac += af.x * af.r;
                ai += af.y * af.r
            }
            this.centerX = ac / ae;
            this.centerY = ai / ae;
            this.updateComponents();
            this.globalForceX = 0;
            return this.globalForceY = 0
        };
        Z.prototype.calculateForce = function(ar, ad) {
            var af, ae, az, ax, al, aq, am, ak, aj, aw, au, av, at, ah, ag, ap, ao, an, ac, ay, ai;
            ah = this.nodes[ar];
            am = this.oldForceX[ar] * ad;
            ak = this.oldForceY[ar] * ad;
            aj = this.oldForceZ[ar] * ad;
            ai = ah.edges;
            for (ac = 0, ay = ai.length; ac < ay; ac++) {
                aw = ai[ac];
                ag = aw.to;
                ap = ah.x - ag.x;
                ao = ah.y - ag.y;
                an = ah.z - ag.z;
                at = Math.sqrt(ap * ap + ao * ao + an * an);
                if (at < 0.01) {
                    at = 0.01
                }
                au = (aw.len - at) * aw.K / at * this.linkForceFactor;
                am += au * ap;
                ak += au * ao;
                aj += au * an
            }
            am += ah.repulsiveForceX * this.nodeRepulsionFactor;
            ak += ah.repulsiveForceY * this.nodeRepulsionFactor;
            aj += ah.repulsiveForceZ * this.nodeRepulsionFactor;
            av = ah.zattr * this.zAxisAttraction / 7;
            aj -= ah.z * av;
            al = ah.component;
            af = this.componentX[al] - this.centerX;
            ae = this.componentY[al] - this.centerY;
            aq = Math.min(10, Math.sqrt(this.componentNodeCount[al]));
            az = af * aq * this.componentCenterFactor;
            ax = ae * aq * this.componentCenterFactor;
            am -= az;
            ak -= ax;
            this.globalForceX += az;
            this.globalForceY += ax;
            if (isNaN(am)) {
                throw"Nan in layout"
            }
            this.forceX[ar] = am;
            this.forceY[ar] = ak;
            this.forceZ[ar] = aj;
            return this.forceSum[ar] = 1 / (ah.fsum + av)
        };
        Z.prototype.storeNodes = function(ac) {
            var ad, af, ae;
            for (ad = af = 0, ae = this.nodeCount - 1; af <= ae; ad = af += 1) {
                if (!this.nodes[ad].locked) {
                    ac[ad].x = this.nodes[ad].x;
                    ac[ad].y = this.nodes[ad].y
                }
            }
        };
        Z.prototype.updateAspectRatio = function(am) {
            var ar, aq, aj, ag, ay, ao, an, al, aw, aD, aB, ax, ap, aE, aC, af, av, au, aA, az, ak, ai, ae, ac, at, ah, ad;
            aw = this.nodes;
            aA = az = aw[0].x;
            ak = ai = aw[0].y;
            for (ay = ae = 1, at = this.nodeCount - 1; ae <= at; ay = ae += 1) {
                aA = Math.min(aA, aw[ay].x);
                az = Math.max(az, aw[ay].x);
                ak = Math.min(ak, aw[ay].y);
                ai = Math.max(ai, aw[ay].y)
            }
            aj = (aA + az) / 2;
            ag = (ak + ai) / 2;
            av = az - aA;
            au = ai - ak;
            ap = Math.sqrt(this.aspectRatio);
            af = Math.sqrt(av * au);
            aE = af * ap / av;
            aC = af / ap / au;
            aE = am * aE + (1 - am);
            aC = am * aC + (1 - am);
            ao = aj - aj * aE;
            an = ag - ag * aC;
            al = 1 / this.forceReductionFactor;
            ad = [];
            for (ay = ac = 0, ah = this.nodeCount - 1; ac <= ah; ay = ac += 1) {
                ax = aw[ay];
                ar = ax.x;
                aq = ax.y;
                ax.x = aD = ar * aE + ao;
                ax.y = aB = aq * aC + an;
                this.forceX[ay] += (aD - ar) * al;
                ad.push(this.forceY[ay] += (aB - aq) * al)
            }
            return ad
        };
        Z.prototype.centerNodes = function() {
            var aj, af, am, ae, ad, ac, ao, an, ak, ai, al, ah, ag;
            ae = this.nodes;
            ad = ac = ae[0].x;
            ao = an = ae[0].y;
            for (am = ak = 1, al = this.nodeCount - 1; ak <= al; am = ak += 1) {
                ad = Math.min(ad, ae[am].x);
                ac = Math.max(ac, ae[am].x);
                ao = Math.min(ao, ae[am].y);
                an = Math.max(an, ae[am].y)
            }
            aj = (ad + ac) / 2;
            af = (ao + an) / 2;
            ag = [];
            for (am = ai = 0, ah = this.nodeCount - 1; ai <= ah; am = ai += 1) {
                ae[am].x -= aj;
                ag.push(ae[am].y -= af)
            }
            return ag
        };
        Z.prototype.randomNodePermutation = function() {
            var ad, ae, ac, ag, af;
            for (ad = ag = 0, af = this.nodeCount - 1; ag <= af; ad = ag += 1) {
                ae = Math.floor(this.random.get() * (this.nodeCount - ad)) + ad;
                ac = this.nodePermutation[ad];
                this.nodePermutation[ad] = this.nodePermutation[ae];
                this.nodePermutation[ae] = ac
            }
        };
        return Z
    })();
    var R;
    R = (function() {
        Z.prototype.formula = null;
        Z.prototype.startTime = null;
        Z.prototype.from = 0;
        Z.prototype.to = 0;
        Z.prototype.fromColor = null;
        Z.prototype.toColor = null;
        Z.prototype.t = 0;
        Z.prototype.startSpeed = 0;
        Z.prototype.easing_formulas = {"=": function(aa) {
                return aa
            }, "<>": function(aa) {
                if (aa < 0.5) {
                    return 2 * aa * aa
                } else {
                    return -0.5 * ((aa * 2 - 1) * (aa * 2 - 3) - 1)
                }
            }, scroll: function(aa) {
                return 1 - (1 - aa) * (1 - aa)
            }};
        function Z(ae, ad, ab, ac, aa) {
            this.from = ae;
            this.to = ad;
            this.duration = ab;
            if (ac == null) {
                ac = "<>"
            }
            if (this.from === void 0 || this.from === null) {
                this.from = this.to
            }
            this.startTime = aa === void 0 ? new Date().getTime() : aa;
            this.x = this.from;
            this.t = this.startTime;
            if (!this.easing_formulas[ac]) {
                throw"Easing formula not defined: " + ac
            } else {
                this.formula = this.easing_formulas[ac]
            }
        }
        Z.prototype.jump = function(aa) {
            this.to = aa;
            this.from = aa;
            this.x = aa;
            return this.t = this.startTime = 0
        };
        Z.prototype.retarget = function(aa, ab) {
            ab = ab === void 0 ? new Date().getTime() : ab;
            if (this.finished(this.t)) {
                this.startSpeed = 0
            } else {
                this.startSpeed = this._getSpeed()
            }
            this.from = this.get(ab);
            this.to = aa;
            this.startTime = ab;
            return this
        };
        Z.prototype.retargetColor = function(aa, ab) {
            if (ab === void 0) {
                ab = this.t ? this.t : new Date().getTime()
            }
            this.startSpeed = 0;
            this.from = this.x;
            this.to = aa;
            this.fromColor = null;
            this.toColor = null;
            this.startTime = ab;
            return this
        };
        Z.prototype.updateAndGet = function(ab, ac) {
            var aa;
            aa = this.x !== ab;
            if (ab !== this.to) {
                this.retarget(ab, ac)
            }
            return[this.get(ac), aa]
        };
        Z.prototype.updateAndGetFixed = function(ab, ac) {
            var aa;
            aa = this.x !== ab;
            if (ab !== this.to) {
                this.startSpeed = 0;
                this.startTime = ac;
                this.from = this.x;
                this.to = ab;
                this.fromColor = null;
                this.toColor = null
            }
            return[this.get(ac), aa]
        };
        Z.prototype.updateColorAndGet = function(ab, ac) {
            var aa;
            aa = this.x !== ab;
            if (ab !== this.to) {
                this.retargetColor(ab, ac)
            }
            return[this.getColor(ac), aa]
        };
        Z.prototype.get = function(ad) {
            var aa, ab, ac, ae;
            if (this.duration <= 0) {
                this.t = ad;
                this.x = this.to;
                return this.to
            }
            ab = Math.min(1, Math.max(ad - this.startTime, 0) / this.duration);
            if (ab >= 1) {
                this.t = ad;
                this.x = this.to;
                return this.to
            }
            aa = this.formula(ab);
            ae = aa * (this.to - this.from);
            if (this.startSpeed && ab < 1) {
                ac = this.startSpeed * ab * this.duration;
                ae = ae * aa + ac * (1 - aa)
            }
            ae = this.from + ae;
            this.t = ad;
            this.x = ae;
            return ae
        };
        Z.prototype.getColor = function(ad) {
            var af, ae, ab, ak, an, am, ao, aj, ah, ac, al, aa, ai, ag;
            this.t = ad;
            if (this.duration <= 0 || this.from === this.to) {
                return this.to
            }
            if (this.fromColor == null) {
                this.fromColor = j.parseCSSColor(this.from)
            }
            if (this.toColor == null) {
                this.toColor = j.parseCSSColor(this.to)
            }
            ao = Math.min(1, Math.max(ad - this.startTime, 0) / this.duration);
            am = this.formula(ao);
            an = 1 - am;
            ai = this.fromColor, ak = ai[0], ab = ai[1], ae = ai[2], af = ai[3];
            ag = this.toColor, al = ag[0], ac = ag[1], ah = ag[2], aj = ag[3];
            aa = "rgba(" + (Math.round(ak * an + al * am)) + "," + (Math.round(ab * an + ac * am)) + "," + (Math.round(ae * an + ah * am)) + "," + ((af * an + aj * am).toFixed(3)) + ")";
            this.t = ad;
            this.x = aa;
            return aa
        };
        Z.prototype.finished = function(aa) {
            return aa >= this.startTime + this.duration
        };
        Z.prototype._getSpeed = function() {
            var ac, ad, ab, aa;
            aa = this.t;
            ac = this.duration / 1000;
            ad = this.get(aa - ac / 2);
            ab = this.get(aa + ac / 2);
            this.t = aa;
            return(ab - ad) / ac
        };
        return Z
    })();
    var J;
    J = (function() {
        function Z(aa) {
            this.chart = aa;
            this.scene = aa.scene;
            this.events = aa.events;
            this.pointer1 = null;
            this.pointer2 = null;
            this.x1 = 0;
            this.y1 = 0;
            this.x2 = 0;
            this.y2 = 0;
            this.centerX = 0;
            this.centerY = 0;
            this.centerDistance = 1;
            this.resetZoom = false;
            this.animatorX = new R(0, 0, this.scene.settings.interaction.zooming.autoZoomDuration, "=");
            this.animatorY = new R(0, 0, this.scene.settings.interaction.zooming.autoZoomDuration, "=");
            this.animatorZ = new R(0, 0, this.scene.settings.interaction.zooming.autoZoomDuration, "=")
        }
        Z.prototype.onWheel = function(ab) {
            var aa;
            if (!(this.scene.xyInChart(ab.x, ab.y) && this.scene.settings.interaction.zooming.wheel)) {
                return
            }
            aa = Math.pow(1 + this.scene.settings.interaction.zooming.sensitivity, ab.wheely * 0.004);
            this.zoom(aa, ab.x, ab.y);
            ab.consumed = true;
            return ab.changes.position = true
        };
        Z.prototype.onPointerDown = function(ae) {
            var ad, ac, ab, af, aa, ag;
            if (this.pointer1 === null) {
                this.pointer1 = ae.identifier;
                af = [ae.x, ae.y], this.x1 = af[0], this.y1 = af[1];
                return ae.consumed = true
            } else {
                if (this.pointer2 === null) {
                    this.pointer2 = ae.identifier;
                    aa = [ae.x, ae.y], this.x2 = aa[0], this.y2 = aa[1];
                    ag = this.scene.fromDisplay((this.x1 + this.x2) / 2, (this.y1 + this.y2) / 2), this.centerX = ag[0], this.centerY = ag[1];
                    ad = this.x1 - this.x2;
                    ac = this.y1 - this.y2;
                    ab = Math.sqrt(ad * ad + ac * ac);
                    this.centerDistance = ab / this.scene.zoom;
                    return ae.consumed = true
                }
            }
        };
        Z.prototype.onPointerDrag = function(aa) {
            if (aa.identifier === this.pointer1 && this.pointer2 === null) {
                this.scene.centerX -= aa.dx / this.scene.zoom;
                this.scene.centerY -= aa.dy / this.scene.zoom;
                this.scene.settings.interaction.zooming.autoZoom = false;
                aa.changes.position = true;
                return aa.consumed = true
            } else {
                if (aa.identifier === this.pointer1 && this.scene.settings.interaction.zooming.fingers) {
                    this.twoFingerDrag(aa.x, aa.y, this.x2, this.y2);
                    aa.changes.position = true;
                    return aa.consumed = true
                } else {
                    if (aa.identifier === this.pointer2 && this.scene.settings.interaction.zooming.fingers) {
                        this.twoFingerDrag(this.x1, this.y1, aa.x, aa.y);
                        aa.changes.position = true;
                        return aa.consumed = true
                    }
                }
            }
        };
        Z.prototype.onPointerUp = function(aa) {
            if (this.pointer2 === aa.identifier) {
                return this.pointer2 = null
            } else {
                if (this.pointer1 === aa.identifier) {
                    if (this.pointer2 !== null) {
                        this.pointer1 = this.pointer2;
                        this.pointer2 = null;
                        this.x1 = this.x2;
                        return this.y1 = this.y2
                    } else {
                        return this.pointer1 = null
                    }
                }
            }
        };
        Z.prototype.onDoubleClick = function(aa) {
            var ab;
            ab = this.scene.settings.interaction.zooming.doubleClickZoom;
            if (ab) {
                this.zoom(ab, aa.x, aa.y);
                aa.changes.position = true;
                return aa.consumed = true
            }
        };
        Z.prototype.twoFingerDrag = function(ac, al, aa, aj) {
            var ag, af, am, ai, ae, ad, ab, ak, ah;
            ab = aa - ac;
            ak = aj - al;
            ai = Math.sqrt(ab * ab + ak * ak) / this.scene.zoom;
            ag = (aa + ac) / 2;
            af = (aj + al) / 2;
            ah = this.scene.fromDisplay(ag, af), ae = ah[0], ad = ah[1];
            this.scene.centerX += this.centerX - ae;
            this.scene.centerY += this.centerY - ad;
            am = ai / this.centerDistance;
            this.zoom(am, ag, af);
            this.x1 = ac;
            this.y1 = al;
            this.x2 = aa;
            return this.y2 = aj
        };
        Z.prototype.zoom = function(ah, aG, aE) {
            var av, at, az, ay, au, ax, aB, aA, ab, aa, ao, an, ag, ad, ar, aq, aD, aC, am, al, ak, aw, af, aF, ap, aj, ai, ae, ac;
            ap = this.scene.getVisibleBounds(), ab = ap[0], ao = ap[1], aa = ap[2], an = ap[3];
            az = this.scene.settings.interaction.zooming.zoomExtent;
            au = Math.max(az[0], Math.min(az[1], this.scene.zoom * ah));
            ah = au / this.scene.zoom;
            if (aG !== void 0 && aE !== void 0) {
                aj = this.scene.fromDisplay(aG, aE), aB = aj[0], aA = aj[1]
            } else {
                if (this.scene.selection.length > 0) {
                    am = 0;
                    aw = 0;
                    ay = 0;
                    ai = this.scene.selection;
                    for (af = 0, aF = ai.length; af < aF; af++) {
                        ax = ai[af];
                        if (ax.isNode) {
                            am += ax.x;
                            aw += ax.y;
                            ay += 1
                        }
                    }
                    if (ay > 0) {
                        aB = am / ay;
                        aA = aw / ay
                    }
                }
            }
            if (aB && aA) {
                this.scene.centerX = (this.scene.centerX - aB) / ah + aB;
                this.scene.centerY = (this.scene.centerY - aA) / ah + aA
            } else {
                aB = this.scene.centerX;
                aA = this.scene.centerY
            }
            this.scene.zoom *= ah;
            ae = this.scene.getGraphBounds(), aD = ae[0], al = ae[1], aC = ae[2], ak = ae[3];
            ac = this.scene.getVisibleBounds(), ag = ac[0], ar = ac[1], ad = ac[2], aq = ac[3];
            if (aB < aD || aB > aC) {
                if (ag > aD && ad > aC) {
                    av = Math.max(aC - ad, aD - ag)
                } else {
                    if (ad < aC && ag < aD) {
                        av = Math.min(aC - ad, aD - ag)
                    } else {
                        av = 0
                    }
                }
                this.scene.centerX += av
            }
            if (aA < al || aA > ak) {
                if (ar > al && aq > ak) {
                    at = Math.max(ak - aq, al - ar)
                } else {
                    if (aq < ak && ar < aD) {
                        at = Math.min(ak - aq, al - ar)
                    } else {
                        at = 0
                    }
                }
                this.scene.centerY += at
            }
            this.animatorX.jump(this.scene.centerX);
            this.animatorY.jump(this.scene.centerY);
            this.animatorZ.jump(this.scene.zoom);
            return this.scene.settings.interaction.zooming.autoZoom = false
        };
        Z.prototype.doAnimations = function(ab) {
            var ad, ag, am, ah, af, an, ae, ac, al, aj, ak, aa, ai;
            if (this.resetZoom) {
                this.resetZoom = false;
                return this.zoomToFit()
            } else {
                if (this.scene.settings.interaction.zooming.autoZoom) {
                    ae = ab.time;
                    ai = this.computeFitParams(), ah = ai[0], af = ai[1], ak = ai[2];
                    ag = 0.01;
                    am = 1 + ag;
                    ad = 1 - ag;
                    aa = this.animatorZ.to / ak;
                    if (aa > am || aa < ad) {
                        this.animatorZ.retargetColor(ak)
                    }
                    ac = this.scene.width;
                    al = (this.animatorX.to - ah) * ak / ac;
                    if (al > ag || al < -ag) {
                        this.animatorX.retargetColor(ah)
                    }
                    an = this.scene.height;
                    aj = (this.animatorY.to - af) * ak / an;
                    if (aj > ag || aj < -ag) {
                        this.animatorY.retargetColor(af)
                    }
                    this.scene.centerX = this.animatorX.get(ae);
                    this.scene.centerY = this.animatorY.get(ae);
                    this.scene.zoom = this.animatorZ.get(ae);
                    if (!(this.animatorX.finished(ae)) || !(this.animatorY.finished(ae)) || !(this.animatorZ.finished(ae))) {
                        return ab.animating = true
                    }
                }
            }
        };
        Z.prototype.zoomToFit = function() {
            var aa;
            aa = this.computeFitParams(), this.scene.centerX = aa[0], this.scene.centerY = aa[1], this.scene.zoom = aa[2];
            this.animatorX.jump(this.scene.centerX);
            this.animatorY.jump(this.scene.centerY);
            this.animatorZ.jump(this.scene.zoom);
            return false
        };
        Z.prototype.computeFitParams = function() {
            var ad, ac, ah, af, aj, ab, aa, ai, ag, ak, ae;
            ae = this.scene.getGraphBounds(), ab = ae[0], ai = ae[1], aa = ae[2], ag = ae[3];
            if (ab === aa && ai === ag) {
                return[0, 0, 1]
            } else {
                aj = this.scene.width;
                af = this.scene.height;
                ad = (ab + aa) / 2;
                ac = (ai + ag) / 2;
                ak = Math.min(aj / (aa - ab), af / (ag - ai)) * 0.9;
                ah = this.scene.settings.interaction.zooming.zoomExtent;
                ak = Math.max(ah[0], Math.min(ah[1], ak));
                return[ad, ac, ak]
            }
        };
        return Z
    })();
    var Q, X, q, Y = {}.hasOwnProperty, E = [].slice;
    if (typeof String.prototype.trim === "undefined") {
        String.prototype.trim = function() {
            return this.replace(/^\s\s*/, "").replace(/\s\s*$/, "")
        }
    }
    q = window.requestAnimationFrame || window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame || window.msRequestAnimationFrame || window.oRequestAnimationFrame;
    if (!q) {
        X = 0;
        q = function(ac) {
            var Z, ab, aa;
            Z = new Date().getTime();
            aa = Math.max(0, 16 - (Z - X));
            ab = window.setTimeout(function() {
                return ac(Z + aa)
            }, aa);
            X = Z + aa;
            return ab
        }
    }
    window.requestAnimationFrame = q;
    Q = (function() {
        function Z() {
        }
        Z.prototype.baseCSSClass = "DWSL";
        Z.extend = function(ab, aa) {
            var ac, ad;
            if (ab == null) {
                return{}
            }
            for (ac in aa) {
                if (!Y.call(aa, ac)) {
                    continue
                }
                ad = aa[ac];
                ab[ac] = ad
            }
            return ab
        };
        Z.extendDeep = function(ab, aa) {
            var ac, ae, ad;
            if (ab == null) {
                return aa
            }
            for (ac in aa) {
                if (!Y.call(aa, ac)) {
                    continue
                }
                ae = aa[ac];
                ad = ab[ac];
                if (Z.isObject(ad) && Z.isObject(ae)) {
                    this.extendDeep(ad, ae)
                } else {
                    ab[ac] = ae
                }
            }
            return ab
        };
        Z.configure = function(ab, ac) {
            var aa;
            for (aa in ac) {
                if (typeof ab[aa] === "undefined" && ac[aa]) {
                    ab[aa] = ac[aa]
                }
            }
            return ab
        };
        Z.clone = function(ac) {
            var aa, ab, ad;
            ab = {};
            for (aa in ac) {
                if (!Y.call(ac, aa)) {
                    continue
                }
                ad = ac[aa];
                ab[aa] = ad
            }
            return ab
        };
        Z.isArray = function(aa) {
            return aa instanceof Array
        };
        Z.isObject = function(aa) {
            return aa !== null && typeof aa === "object"
        };
        Z.isFunction = function(aa) {
            return typeof aa === "function"
        };
        Z.isNumber = function(aa) {
            return !isNaN(parseFloat(aa)) && isFinite(aa)
        };
        Z.isString = function(aa) {
            return Object.prototype.toString.call(aa) === "[object String]"
        };
        Z.hasProperties = function(ac) {
            var ab, aa;
            if (!ac) {
                return false
            }
            for (ab in ac) {
                if (!Y.call(ac, ab)) {
                    continue
                }
                aa = ac[ab];
                return true
            }
            return false
        };
        Z.removeProperty = function(ac) {
            var ab, aa;
            for (ab in ac) {
                if (!Y.call(ac, ab)) {
                    continue
                }
                aa = ac[ab];
                delete ac[ab];
                return ab
            }
            return null
        };
        Z.removePropertyValue = function(ac) {
            var ab, aa;
            for (ab in ac) {
                if (!Y.call(ac, ab)) {
                    continue
                }
                aa = ac[ab];
                delete ac[ab];
                return[ab, aa]
            }
            return null
        };
        Z.countProperties = function(ac) {
            var ad, ab, aa;
            ad = 0;
            for (ab in ac) {
                if (!Y.call(ac, ab)) {
                    continue
                }
                aa = ac[ab];
                ad += 1
            }
            return ad
        };
        Z.realClone = function(af) {
            var ab, ah, ad, ag, ac, ae, aa;
            ag = this.isObject(af);
            ab = this.isArray(af);
            if (ab) {
                ah = [];
                for (ad = ae = 0, aa = af.length; ae < aa; ad = ++ae) {
                    ac = af[ad];
                    if (typeof ac !== "function") {
                        ah[ad] = this.realClone(ac)
                    } else {
                        ah[ad] = ac
                    }
                }
            } else {
                if (ag) {
                    ah = {};
                    for (ad in af) {
                        ac = af[ad];
                        if (typeof ac !== "function") {
                            ah[ad] = this.realClone(ac)
                        } else {
                            ah[ad] = ac
                        }
                    }
                } else {
                    ah = af
                }
            }
            return ah
        };
        Z.arrayContains = function(aa, ad) {
            var ac, ae, ab;
            for (ae = 0, ab = aa.length; ae < ab; ae++) {
                ac = aa[ae];
                if (ac === ad) {
                    return true
                }
            }
            return false
        };
        Z.removeFromArray = function(aa, ad) {
            var ac, ae, ab;
            ae = false;
            for (ac in aa) {
                ab = aa[ac];
                if (ab === ad) {
                    aa.splice(ac, 1);
                    ae = true
                }
            }
            return ae
        };
        Z.arraysEqual = function(ab, aa) {
            var ac, ae, ad;
            if (!((ab != null) && (aa != null))) {
                return false
            }
            if (ab.length !== aa.length) {
                return false
            }
            for (ac = ae = 0, ad = ab.length - 1; ae <= ad; ac = ae += 1) {
                if (ab[ac] !== aa[ac]) {
                    return false
                }
            }
            return true
        };
        Z.log = function(ab, aa) {
            if (typeof console !== "undefined" && console !== null) {
                if (aa != null) {
                    return console.info(ab, aa)
                } else {
                    return console.info(ab)
                }
            }
        };
        Z.error = function(ab, aa) {
            if (typeof console !== "undefined" && console !== null) {
                if (aa != null) {
                    return console.error(ab, aa)
                } else {
                    return console.error(ab)
                }
            }
        };
        Z.getExtension = function(aa) {
            var ab;
            ab = /(?:\.([^.]+))?$/;
            return ab.exec(aa)[1]
        };
        Z.createDom = function(ad, ab, ac, aa) {
            var ae;
            ae = document.createElement(ad);
            if (ab != null) {
                ae.className = ab
            }
            if (ac != null) {
                ae.innerHTML = ac
            }
            if (aa != null) {
                aa.appendChild(ae)
            }
            return ae
        };
        Z.createStyledDom = function(ae, ag, ad, aa) {
            var af, ac, ab;
            af = document.createElement(ae);
            if (ag != null) {
                for (ac in ag) {
                    if (!Y.call(ag, ac)) {
                        continue
                    }
                    ab = ag[ac];
                    af.style[ac] = ab
                }
            }
            if (ad != null) {
                af.innerHTML = ad
            }
            if (aa != null) {
                aa.appendChild(af)
            }
            return af
        };
        Z.hasClass = function(ab, aa) {
            return(ab.className.length > 0) && new RegExp("(^|\\s)" + aa + "(\\s|$)").test(ab.className)
        };
        Z.addClass = function(ab, aa) {
            if (!Z.hasClass(ab, aa)) {
                if (ab.className.length === 0) {
                    return ab.className = aa
                } else {
                    return ab.className = ab.className + " " + aa
                }
            }
        };
        Z.removeClass = function(ac, aa) {
            var ab;
            ab = function(ad, ae) {
                if (ae === aa) {
                    return""
                } else {
                    return ad
                }
            };
            return ac.className = ac.className.replace(/(\S+)\s*/g, ab).replace(/(^\s+|\s+$)/, "")
        };
        Z.setClass = function(ab, aa) {
            return ab.className = aa
        };
        Z.listen = function(ac, ab, aa) {
            if (ac.addEventListener) {
                return ac.addEventListener(ab, aa)
            } else {
                return ac.attachEvent("on" + ab, aa)
            }
        };
        Z.unlisten = function(ac, ab, aa) {
            if (ac.removeEventListener) {
                return ac.removeEventListener(ab, aa)
            } else {
                return ac.detachEvent("on" + ab, aa)
            }
        };
        Z.createEvent = function(aa) {
            var ab;
            if (document.createEvent) {
                ab = document.createEvent("Event");
                ab.initEvent(aa, true, true)
            } else {
                ab = document.createEventObject()
            }
            return ab
        };
        Z.canvasScaling = function() {
            var aa;
            aa = 1;
            if (window.devicePixelRatio) {
                aa = window.devicePixelRatio
            } else {
                if (window.screen.systemXDPI) {
                    aa = window.screen.systemXDPI / window.screen.logicalXDPI
                }
            }
            return[aa, aa]
        };
        Z.elementPos = function(ac) {
            var ab, aa;
            ab = 0;
            aa = 0;
            while (ac.offsetParent != null) {
                ab += ac.offsetLeft;
                aa += ac.offsetTop;
                ac = ac.offsetParent
            }
            return[ab, aa]
        };
        Z.isParentOf = function(aa, ab) {
            while (ab != null) {
                if (ab === aa) {
                    return true
                }
                ab = ab.parentElement
            }
            return false
        };
        Z.fadeIn = function(aa) {
            return aa.style.display = "block"
        };
        Z.fadeOut = function(aa) {
            return aa.style.display = "none"
        };
        Z.hide = function(aa) {
            return aa.style.display = "none"
        };
        Z.show = function(aa) {
            return aa.style.display = "block"
        };
        Z.wrapClass = function(ad, ag) {
            var ae, aa, af, ac, ab;
            if (!this.baseCSSClass) {
                this.baseCSSClass = "DVSL"
            }
            if (!ad) {
                ad = this.baseCSSClass
            }
            if (typeof ad === "object") {
                if (ad.objClass) {
                    ad = ad.objClass
                } else {
                    ad = this.baseCSSClass
                }
            }
            aa = ag.split(",");
            ae = "";
            for (ac = 0, ab = aa.length; ac < ab; ac++) {
                af = aa[ac];
                if (ae) {
                    ae += " "
                }
                ae += ad + "-" + af
            }
            return ae
        };
        Z.getProp = function(af, ab) {
            var ac, ae, aa, ad;
            ad = ab.split("/");
            for (ae = 0, aa = ad.length; ae < aa; ae++) {
                ac = ad[ae];
                if (af.hasOwnProperty(ac)) {
                    af = af[ac]
                } else {
                    return void 0
                }
            }
            return af
        };
        Z.hasProp = function(af, ab) {
            var ac, ae, aa, ad;
            ad = ab.split("/");
            for (ae = 0, aa = ad.length; ae < aa; ae++) {
                ac = ad[ae];
                if (af.hasOwnProperty(ac)) {
                    af = af[ac]
                } else {
                    return false
                }
            }
            return af !== void 0
        };
        Z.getScroll = function() {
            var aa, ad, ac, ab;
            ad = document.documentElement;
            aa = document.body;
            ac = ad && ad.scrollLeft || aa && aa.scrollLeft || 0;
            ab = ad && ad.scrollTop || aa && aa.scrollTop || 0;
            return[ac, ab]
        };
        Z.isWithIn = function(aa, ab) {
            if (aa[0] < ab[0] || aa[0] > ab[2] || aa[1] < ab[1] || aa[1] > ab[3]) {
                return true
            } else {
                return false
            }
        };
        Z.mixIn = function(ae, af) {
            var ac, ab, ad, aa;
            ad = af.prototype;
            aa = [];
            for (ac in ad) {
                ab = ad[ac];
                aa.push(ae[ac] = ab)
            }
            return aa
        };
        Z.sign = function(aa) {
            if (!aa) {
                return 0
            }
            if (aa < 0) {
                return -1
            }
            return 1
        };
        Z.each = function() {
            var ag, ac, ai, aa, af, aj, ad, ah, ae, ab;
            ai = arguments[0], aa = arguments[1], ag = 3 <= arguments.length ? E.call(arguments, 2) : [];
            af = [];
            if (Z.isArray(this[ai])) {
                ae = this[ai];
                for (ad = 0, ah = ae.length; ad < ah; ad++) {
                    aj = ae[ad];
                    if (aj[aa] != null) {
                        af.push(aj[aa].apply(aj, ag))
                    } else {
                        console.error(aj);
                        throw"Object " + aj + "does not have method: " + aa
                    }
                }
            } else {
                if (Z.isObject(this[ai])) {
                    ab = this[ai];
                    for (ac in ab) {
                        aj = ab[ac];
                        if (aj[aa] != null) {
                            af.push(aj[aa].apply(aj, ag))
                        } else {
                            console.error(aj);
                            throw"Object " + aj + "does not have method " + aa
                        }
                    }
                } else {
                    console.error(ai, aa, ag);
                    throw"Called iterator each on non-object/non-array"
                }
            }
            return af
        };
        Z.detectBrowser = function() {
            var aa, ad, ab, ac;
            ad = navigator.appName;
            ac = navigator.userAgent;
            aa = ac.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
            if (aa && (ab = ac.match(/version\/([\.\d]+)/i)) !== null) {
                aa[2] = ab[1]
            }
            if (aa) {
                aa = [aa[1], aa[2]]
            } else {
                aa = [ad, navigator.appVersion, "-?"]
            }
            return aa[0].toLowerCase()
        };
        Z.nextIdentifier = 0;
        Z.getIdentifier = function() {
            return Z.nextIdentifier++
        };
        Z.doRequest = function(aa, ae, aj, ad) {
            var ac, ab, ah, af, ai, ag = this;
            ac = [];
            for (af = 0, ai = ae.length; af < ai; af++) {
                ab = ae[af];
                ac.push("" + (encodeURIComponent(ab[0])) + "=" + (encodeURIComponent(ab[1])))
            }
            ac = ac.join("&");
            if (aa.indexOf("?") !== -1) {
                aa += "&" + ac
            } else {
                aa += "?" + ac
            }
            if (window.XMLHttpRequest) {
                ah = new XMLHttpRequest()
            } else {
                if (window.ActiveXObject) {
                    ah = new ActiveXObject("Microsoft.XMLHTTP")
                }
            }
            if (ah) {
                ah.onreadystatechange = function() {
                    if (ah.readyState === 4) {
                        if (ah.status === 200) {
                            return aj(ah.responseText)
                        } else {
                            return ad()
                        }
                    }
                };
                ah.open("GET", aa, true);
                return ah.send("")
            }
        };
        Z.openUrl = function(aa) {
            if (Z.isString(aa)) {
                return window.open(aa)
            } else {
                return window.open(aa.url, aa.name, aa.specs, aa.replace)
            }
        };
        Z.parseData = function(ae, ad, ab) {
            var ac;
            ac = null;
            if (ad === "JSON") {
                if (typeof ae === "string" || ae instanceof String) {
                    try {
                        ac = JSON.parse(ae)
                    } catch (aa) {
                        ab.error("Error: failed to parse JSON response: " + aa + ": " + ae);
                        ac = {error: "Error: failed to parse JSON response"}
                    }
                } else {
                    ac = ae
                }
            } else {
                ab.error("Unsupported data format: " + ad)
            }
            return ac
        };
        return Z
    })();
    var C;
    C = (function() {
        function Z() {
        }
        Z.prototype.chartWidth = 1;
        Z.prototype.chartHeight = 1;
        Z.prototype.toolbarHeight = 0;
        Z.prototype.x0 = 0;
        Z.prototype.y0 = 0;
        Z.prototype.height = 100;
        Z.prototype.width = 100;
        Z.prototype.canvasScaleX = 1;
        Z.prototype.canvasScaleY = 1;
        Z.prototype.settings = null;
        Z.prototype.loading = true;
        Z.prototype.messages = {};
        Z.prototype.setMessage = function(aa, ad, ab) {
            var ac;
            if (ad != null) {
                ac = (this.messages[aa] == null) || this.messages[aa].msg !== ad || this.messages[aa].pri !== ab;
                this.messages[aa] = {msg: ad, pri: ab}
            } else {
                ac = this.messages[aa] != null;
                delete this.messages[aa]
            }
            return ac
        };
        Z.prototype.getMessage = function() {
            var ab, aa, ae, ac, ad;
            aa = null;
            ac = 0;
            ad = this.messages;
            for (ab in ad) {
                ae = ad[ab];
                if (ae.pri > ac) {
                    aa = ae.msg;
                    ac = ae.pri
                }
            }
            return aa
        };
        Z.prototype.getChartBounds = function() {
            throw"GetChartBounds needs to be implmented in subclass"
        };
        return Z
    })();
    var l, s, p, i = this, Y = {}.hasOwnProperty;
    l = (function() {
        Z.prototype.time = 0;
        Z.prototype.changes = {};
        Z.prototype.consumed = false;
        Z.prototype.defaultPrevented = false;
        Z.prototype.preventDefault = function() {
            return this.defaultPrevented = true
        };
        Z.prototype.x = 0;
        Z.prototype.y = 0;
        Z.prototype.dx = 0;
        Z.prototype.dy = 0;
        Z.prototype.vx = 0;
        Z.prototype.vy = 0;
        Z.prototype.wheely = 0;
        Z.prototype.wheelx = 0;
        Z.prototype.identifier = 0;
        Z.prototype.pressed = false;
        Z.prototype.consumed = false;
        Z.prototype.touch = false;
        Z.prototype.swipeUp = false;
        Z.prototype.swipeDown = false;
        Z.prototype.swipeLeft = false;
        Z.prototype.swipeRight = false;
        function Z(aa, ad, ac, ab) {
            this.x = aa;
            this.y = ad;
            this.time = ac;
            this.identifier = ab;
            1
        }
        Z.prototype.distance = function(aa) {
            return Math.sqrt((aa.x - this.x) * (aa.x - this.x) + (aa.y - this.y) * (aa.y - this.y))
        };
        return Z
    })();
    p = (function() {
        function Z(ab, aa) {
            this.settings = aa;
            this.identifier = ab.identifier;
            this.x = ab.x;
            this.y = ab.y;
            this.pageX = ab.pageX;
            this.pageY = ab.pageY;
            this.time = ab.time;
            this.pts = [[this.x, this.y, this.time]]
        }
        Z.prototype.moveTo = function(aa) {
            if (aa.time === this.time) {
                this.pts.pop()
            }
            this.time = aa.time;
            if (aa.x || aa.y) {
                this.x = aa.x;
                this.y = aa.y
            }
            this.pts.push([this.x, this.y, this.time]);
            if (this.pts.length > 6) {
                return this.pts.unshift()
            }
        };
        Z.prototype.getPosAndSpeed = function(ai, aa) {
            var ab, am, ah, ag, al, af, ak, aj, ae, ad, ac;
            ai.x = this.x;
            ai.y = this.y;
            al = this.pts.length - 2;
            if (al >= 0) {
                ai.dx = this.pts[al + 1][0] - this.pts[al][0];
                ai.dy = this.pts[al + 1][1] - this.pts[al][1]
            } else {
                ai.dx = 0;
                ai.dy = 0
            }
            af = Infinity;
            for (ag = ae = 0; ae <= al; ag = ae += 1) {
                ab = this.pts[ag + 1][2] - this.pts[ag][2];
                af = Math.min(af, this.pts[ag + 1][2] - this.pts[ag][2])
            }
            af = Math.max(af, 20);
            ah = -1;
            for (ag = ad = al; ad >= 0; ag = ad += -1) {
                ab = this.pts[ag + 1][2] - this.pts[ag][2];
                if (ab > af * 2) {
                    break
                }
                ah = ag
            }
            if (ah === -1) {
                ai.vx = 0;
                ai.vy = 0;
                return
            }
            ak = 0;
            aj = 0;
            am = 1;
            for (ag = ac = ah; ac <= al; ag = ac += 1) {
                ab = this.pts[ag + 1][2] - this.pts[ag][2];
                ak = ak * (1 - am) + (this.pts[ag + 1][0] - this.pts[ag][0]) / ab * am;
                aj = ak * (1 - am) + (this.pts[ag + 1][1] - this.pts[ag][1]) / ab * am;
                am = 0.6
            }
            ai.vx = ak * 1000;
            return ai.vy = aj * 1000
        };
        return Z
    })();
    s = (function() {
        Z.prototype.ID_MOUSE = "mouse";
        Z.prototype.EVENT_MOVE = "move";
        Z.prototype.EVENT_DOWN = "down";
        Z.prototype.EVENT_DRAG = "drag";
        Z.prototype.EVENT_UP = "up";
        Z.prototype.EVENT_LEAVE = "leave";
        Z.prototype.EVENT_CLICK = "click";
        Z.prototype.EVENT_RCLICK = "rclick";
        Z.prototype.EVENT_DBLCLICK = "dblclick";
        Z.prototype.EVENT_WHEEL = "mwheel";
        Z.prototype.scaleX = 1;
        Z.prototype.scaleY = 1;
        Z.prototype.hasTouch = false;
        Z.prototype.mm = 1;
        Z.prototype.clickEvent = null;
        Z.prototype.cachedContainerPosition = null;
        function Z(aa, ab) {
            var ac = this;
            this.container = aa;
            this.settings = ab;
            this.handleTouchMove = function(ad) {
                return Z.prototype.handleTouchMove.apply(ac, arguments)
            };
            this.handleTouchEnd = function(ad) {
                return Z.prototype.handleTouchEnd.apply(ac, arguments)
            };
            this.handleTouchStart = function(ad) {
                return Z.prototype.handleTouchStart.apply(ac, arguments)
            };
            this.handleMouseMove = function(ad) {
                return Z.prototype.handleMouseMove.apply(ac, arguments)
            };
            this.handleMouseUp = function(ad) {
                return Z.prototype.handleMouseUp.apply(ac, arguments)
            };
            this.handleMouseWheel = function(ad) {
                return Z.prototype.handleMouseWheel.apply(ac, arguments)
            };
            this.handleCMenu = function(ad) {
                return Z.prototype.handleCMenu.apply(ac, arguments)
            };
            this.handleMouseDown = function(ad) {
                return Z.prototype.handleMouseDown.apply(ac, arguments)
            };
            this.updateContainerPosition = function() {
                return Z.prototype.updateContainerPosition.apply(ac, arguments)
            };
            this.listeners = {};
            this.downPointers = {};
            this.inPointers = {};
            this.whiteList = [this.container];
            Q.listen(this.container, "mousedown", this.handleMouseDown);
            Q.listen(this.container, "contextmenu", this.handleCMenu);
            Q.listen(this.container, "mousewheel", this.handleMouseWheel);
            Q.listen(this.container, "DOMMouseScroll", this.handleMouseWheel);
            Q.listen(this.container, "touchstart", this.handleTouchStart);
            Q.listen(window, "mouseup", this.handleMouseUp);
            Q.listen(window, "mousemove", this.handleMouseMove);
            Q.listen(window, "touchend", this.handleTouchEnd);
            Q.listen(window, "touchcancel", this.handleTouchEnd);
            Q.listen(window, "touchmove", this.handleTouchMove);
            Q.listen(window, "resize", this.updateContainerPosition)
        }
        Z.prototype.addWhiteList = function(aa) {
            this.whiteList.push(aa);
            Q.listen(aa, "mousedown", this.handleMouseDown);
            Q.listen(aa, "mousewheel", this.handleMouseWheel);
            Q.listen(aa, "DOMMouseScroll", this.handleMouseWheel);
            return Q.listen(aa, "touchstart", this.handleTouchStart)
        };
        Z.prototype.remove = function() {
            var ac, ab, ae, aa, ad;
            Q.unlisten(this.container, "mousedown", this.handleMouseDown);
            Q.unlisten(this.container, "contextmenu", this.handleCMenu);
            Q.unlisten(this.container, "mousewheel", this.handleMouseWheel);
            Q.unlisten(this.container, "DOMMouseScroll", this.handleMouseWheel);
            Q.unlisten(this.container, "touchstart", this.handleTouchStart);
            if (this.whiteList != null) {
                ad = this.whiteList;
                for (ac = ae = 0, aa = ad.length; ae < aa; ac = ++ae) {
                    ab = ad[ac];
                    Q.unlisten(ab, "mousedown", this.handleMouseDown);
                    Q.unlisten(ab, "mousewheel", this.handleMouseWheel);
                    Q.unlisten(ab, "DOMMouseScroll", this.handleMouseWheel);
                    Q.unlisten(ab, "touchstart", this.handleTouchStart)
                }
            }
            Q.unlisten(window, "mouseup", this.handleMouseUp);
            Q.unlisten(window, "mousemove", this.handleMouseMove);
            Q.unlisten(window, "touchend", this.handleTouchEnd);
            Q.unlisten(window, "touchcancel", this.handleTouchEnd);
            return Q.unlisten(window, "touchmove", this.handleTouchMove)
        };
        Z.prototype.listen = function(aa, ab) {
            return this.listeners[aa] = ab
        };
        Z.prototype.getContainerPosition = function() {
            if (this.cachedContainerPosition != null) {
                return this.cachedContainerPosition
            } else {
                return this.updateContainerPosition()
            }
        };
        Z.prototype.updateContainerPosition = function() {
            this.cachedContainerPosition = Q.elementPos(this.container);
            return this.cachedContainerPosition
        };
        Z.prototype.handleMouseDown = function(aa) {
            var ab;
            if (this.hasTouch) {
                return
            }
            ab = this.buildEvent(aa, this.ID_MOUSE, aa.timeStamp, true);
            this.downHappened(ab);
            if (ab.consumed) {
                return aa.preventDefault()
            }
        };
        Z.prototype.handleCMenu = function(aa) {
            var ab, ac;
            if (aa.witch) {
                ac = aa.which === 3
            } else {
                ac = aa.button === 2
            }
            if (ac) {
                ab = this.buildEvent(aa, this.ID_MOUSE, aa.timeStamp, true);
                this.rclickHappened(ab);
                if (ab.consumed) {
                    return aa.preventDefault()
                }
            }
        };
        Z.prototype.handleMouseWheel = function(aa) {
            var ab;
            ab = this.buildEvent(aa, this.ID_MOUSE, aa.timeStamp, true);
            ab.wheely = aa.wheelDelta | (aa.detail * -40);
            this.wheelHappened(ab);
            if (ab.consumed) {
                return aa.preventDefault()
            }
        };
        Z.prototype.handleMouseUp = function(ab) {
            var ac, aa;
            if (this.hasTouch) {
                return
            }
            if (ab.shiftKey && ab.ctrlKey) {
                this.ID_MOUSE = "mouse" + this.mm;
                this.mm += 1;
                return
            } else {
                aa = true
            }
            ac = this.buildEvent(ab, this.ID_MOUSE, ab.timeStamp, false);
            ac.isRightMB = ab.witch ? ab.which === 3 : ab.button === 2;
            this.upHappened(ac);
            if (ac.consumed) {
                ab.preventDefault()
            }
            if (aa) {
                return this.removeLostTouches(ab, [], [])
            }
        };
        Z.prototype.handleMouseMove = function(aa) {
            var ab;
            if (this.hasTouch) {
                return
            }
            ab = this.buildEvent(aa, this.ID_MOUSE, aa.timeStamp, false);
            this.moveHappened(ab);
            if (ab.consumed) {
                return aa.preventDefault()
            }
        };
        Z.prototype.handleTouchStart = function(ad) {
            var ag, ah, af, ac, ae, ab, aa;
            if (!this.isTargetOkay(ad.target)) {
                return
            }
            this.hasTouch = true;
            this.removeLostTouches(ad, ad.touches, ad.changedTouches);
            ag = false;
            af = ad.changedTouches || ad.touches;
            aa = [];
            for (ae = 0, ab = af.length; ae < ab; ae++) {
                ac = af[ae];
                ah = this.buildEvent(ac, ac.identifier, ad.timeStamp, true);
                this.downHappened(ah);
                aa.push(ag |= ah.consumed)
            }
            return aa
        };
        Z.prototype.handleTouchEnd = function(ac) {
            var af, ae, ab, ad, aa;
            ae = ac.changedTouches || ac.touches;
            for (ad = 0, aa = ae.length; ad < aa; ad++) {
                ab = ae[ad];
                af = this.buildEvent(ab, ab.identifier, ac.timeStamp, false);
                this.upHappened(af)
            }
            return this.removeLostTouches(ac, ac.touches)
        };
        Z.prototype.handleTouchMove = function(ac) {
            var af, ag, ae, ab, ad, aa;
            af = false;
            this.removeLostTouches(ac, ac.touches);
            ae = ac.changedTouches || ac.touches;
            for (ad = 0, aa = ae.length; ad < aa; ad++) {
                ab = ae[ad];
                ag = this.buildEvent(ab, ab.identifier, ac.timeStamp, true);
                this.moveHappened(ag);
                af |= ag.consumed
            }
            if (af) {
                return ac.preventDefault()
            }
        };
        Z.prototype.removeLostTouches = function(aa, aj, ad) {
            var ak, ag, ac, am, an, ah, af, al, ab, ai, ae;
            am = [];
            for (ah = 0, al = aj.length; ah < al; ah++) {
                an = aj[ah];
                am[an.identifier] = true
            }
            ai = this.downPointers;
            for (ag in ai) {
                if (!Y.call(ai, ag)) {
                    continue
                }
                ac = ai[ag];
                if (!am[ag]) {
                    console.log("Removing touch " + ag);
                    ak = this.rebuildEvent(aa, ac, false);
                    this.upHappened(ak)
                }
            }
            if (ad != null) {
                ae = [];
                for (af = 0, ab = ad.length; af < ab; af++) {
                    an = ad[af];
                    ac = this.downPointers[an.identifier];
                    if (ac != null) {
                        console.log("Removing fresh touch " + an.identifier);
                        ak = this.rebuildEvent(aa, ac, false);
                        ae.push(this.upHappened(ak))
                    } else {
                        ae.push(void 0)
                    }
                }
                return ae
            }
        };
        Z.prototype.rebuildEvent = function(aa, ad, ab) {
            var ac;
            ac = new l(ad.x, ad.y, aa.timeStamp, ad.identifier);
            ac.pageX = ad.pageX;
            ac.pageY = ad.pageY;
            ac.pressed = ab;
            ac.shiftKey = aa.shiftKey;
            ac.altKey = aa.altKey;
            ac.ctrlKey = aa.ctrlKey;
            ac.touch = this.hasTouch;
            return ac
        };
        Z.prototype.buildEvent = function(aa, ab, af, ac) {
            var aj, ai, ae, ah, ag, ad;
            ad = this.getContainerPosition(), aj = ad[0], ai = ad[1];
            ah = aa.pageX - aj;
            ag = aa.pageY - ai;
            ae = new l(Math.round(ah * this.scaleX), Math.round(ag * this.scaleY), af, ab);
            ae.target = aa.target;
            ae.touch = this.hasTouch;
            ae.pageX = aa.pageX;
            ae.pageY = aa.pageY;
            ae.shiftKey = aa.shiftKey;
            ae.altKey = aa.altKey;
            ae.ctrlKey = aa.ctrlKey;
            ae.pressed = ac;
            return ae
        };
        Z.prototype.downHappened = function(aa) {
            if (!this.isTargetOkay(aa.target)) {
                return
            }
            aa.pressed = true;
            if (this.downPointers[aa.identifier] != null) {
                console.log("Unexpected down on already down pointer");
                return
            }
            this.downPointers[aa.identifier] = new p(aa, this.settings);
            this.inPointers[aa.identifier] = true;
            return this.fireEvent(this.EVENT_DOWN, aa)
        };
        Z.prototype.upHappened = function(ac) {
            var aa, ab, ad = this;
            this.cachedContainerPosition = null;
            if (this.downPointers[ac.identifier] == null) {
                return
            }
            ab = this.downPointers[ac.identifier];
            ab.moveTo(ac);
            ab.getPosAndSpeed(ac, true);
            delete this.downPointers[ac.identifier];
            if (Math.abs(ac.vx) > Math.abs(ac.vy) * 2) {
                ac.swipeSpeed = Math.abs(ac.vx);
                if (ac.vx > 0) {
                    ac.swipeLeft = true
                }
                if (ac.vx < 0) {
                    ac.swipeRight = true
                }
            } else {
                if (Math.abs(ac.vy) > Math.abs(ac.vx) * 2) {
                    ac.swipeSpeed = Math.abs(ac.vy);
                    if (ac.vy < 0) {
                        ac.swipeUp = true
                    }
                    if (ac.vy > 0) {
                        ac.swipeDown = true
                    }
                }
            }
            this.fireEvent(this.EVENT_UP, ac);
            if (!(ab.scrolling || ac.isRightMB)) {
                if ((this.clickEvent != null) && this.clickEvent.time + this.settings.doubleClickTimeout >= ac.time && this.clickEvent.distance(ac) < this.settings.doubleClickSensitivity) {
                    this.clickEvent = null;
                    return this.fireEvent(this.EVENT_DBLCLICK, ac)
                } else {
                    if (this.settings.noClickOnDoubleClick) {
                        this.clickEvent = ac;
                        aa = function() {
                            if (ad.clickEvent === ac) {
                                ad.fireEvent(ad.EVENT_CLICK, ad.clickEvent);
                                return ad.clickEvent = null
                            }
                        };
                        return setTimeout(aa, this.settings.doubleClickTimeout)
                    } else {
                        this.fireEvent(this.EVENT_CLICK, ac);
                        return this.clickEvent = ac
                    }
                }
            }
        };
        Z.prototype.moveHappened = function(ab) {
            var aa;
            aa = this.downPointers[ab.identifier];
            ab.pressed = aa != null;
            if (aa != null) {
                if (ab.distance(aa) >= this.settings.dragSensitivity || aa.scrolling) {
                    aa.scrolling = true;
                    aa.moveTo(ab);
                    aa.getPosAndSpeed(ab, false);
                    return this.fireEvent(this.EVENT_DRAG, ab)
                }
            } else {
                if (this.clickEvent) {
                    if (this.clickEvent.distance(ab) > this.settings.doubleClickSensitivity) {
                        this.fireEvent(this.EVENT_CLICK, this.clickEvent);
                        return this.clickEvent = null
                    }
                } else {
                    if (this.isTargetOkay(ab.target)) {
                        this.inPointers[ab.identifier] = true;
                        return this.fireEvent(this.EVENT_MOVE, ab)
                    } else {
                        if (this.inPointers.hasOwnProperty(ab.identifier)) {
                            delete this.inPointers[ab.identifier];
                            return this.fireEvent(this.EVENT_LEAVE, ab)
                        }
                    }
                }
            }
        };
        Z.prototype.wheelHappened = function(aa) {
            return this.fireEvent(this.EVENT_WHEEL, aa)
        };
        Z.prototype.rclickHappened = function(aa) {
            return this.fireEvent(this.EVENT_RCLICK, aa)
        };
        Z.prototype.fireEvent = function(aa, ab) {
            if (this.listeners[aa]) {
                return this.listeners[aa].call(this, ab)
            }
        };
        Z.prototype.isTargetOkay = function(af) {
            var ac, ab, ae, aa, ad;
            ad = this.whiteList;
            for (ac = ae = 0, aa = ad.length; ae < aa; ac = ++ae) {
                ab = ad[ac];
                if ((ab === af) || Q.isParentOf(ab, af)) {
                    return true
                }
            }
            return false
        };
        return Z
    })();
    var G;
    G = (function() {
        Z.defaults = {container: null, width: null, height: null, minHeight: 165, maxHeight: 2000, minWidth: 100, maxWidth: 4000, theme: null, assetsUrlBase: "", advanced: {highDpi: {"default": true, safari: false, firefox: true, msie: true, chrome: false}, pointer: {noClickOnDoubleClick: true, dragSensitivity: 10, doubleClickSensitivity: 40, doubleClickTimeout: 300, speedAveragingPeriod: 200}, trackTouches: false, logging: false, style: {messageTextStyle: {fillColor: "#000", font: "15px Arial"}, loadingArcStyle: {r: 35, lineColor: "#444", lineWidth: 2}}, maxCanvasWidth: 2047, maxCanvasHeight: 2047, themeCSSClass: "DVSL-round", assets_applyMethod: "merge", assets: ["base.css"], builtinAssets: {"builtin-logo": K}, exportProxyURL: "http://developers.dvsl.co/export"}, interaction: {resizing: {enabled: true, advanced: {resizerHandleVisibilityTolerance: 45, resizerHandleEnableTolerance: 10}}}, events: {onError: null, onSettingsChange: null}, title: {enabled: true, enabledOnExport: true, align: "center", margin: 25, style: {font: "20px Arial", fillColor: "#000"}, text: ""}, credits: {enabled: false, enabledOnExport: true, href: "http://dvsl.co", image: "builtin-logo"}};
        function Z(ag) {
            var ac, ah, af, ad, aa, ab, ae;
            this._imageCache = {};
            this.apply(Z.defaults);
            ad = new RegExp("((file:///|https?://)[^/]+/.*?)/?" + ag + ".(min.|)js");
            aa = new RegExp("((file:///|https?://)[^/]+/.*/src)/?" + ag);
            ae = document.getElementsByTagName("script");
            for (ac in ae) {
                ab = ae[ac];
                if (ab.src && (ah = ab.src.match(ad))) {
                    if (ah[1][ah[1].length - 1] === "/") {
                        af = ""
                    } else {
                        af = "/"
                    }
                    this.assetsUrlBase = ah[1] + af + "assets/"
                }
                if (ab.src && (ah = ab.src.match(aa))) {
                    if (ah[1][ah[1].length - 1] === "/") {
                        af = ""
                    } else {
                        af = "/"
                    }
                    this.assetsUrlBase = ah[1] + af + "assets/"
                }
            }
        }
        Z.prototype.apply = function(ab) {
            var aa, ac;
            if (ab == null) {
                return
            }
            aa = {};
            ac = null;
            if (ab.theme != null) {
                ac = ab.theme;
                delete ab.theme
            }
            this.applyRec(this, ab, aa, 0);
            if (ac) {
                this.applyRec(this, ac, aa, 0);
                ab.theme = ac
            }
            return aa
        };
        Z.prototype.applyRec = function(ap, ao, al, aq) {
            var an, ak, ar, ad, af, aj, ab, ae, ah, ac, ai, ag, aa, am;
            if (aq > 10) {
                throw"Stack depth greater than 10, seems like recursive settings"
            }
            if (ap === void 0) {
                console.error(aq, ap, ao);
                throw"Tried to applyRec on undefined"
            }
            for (ar in ao) {
                ai = ao[ar];
                ae = ap[ar];
                if (ae !== void 0 && ai === ae) {
                    continue
                }
                an = Q.isArray(ai);
                af = Q.isObject(ai);
                aj = Q.isArray(ae);
                ab = Q.isObject(ae);
                ak = Q.isFunction(ai);
                ah = false;
                if (aj && !an) {
                    console.error("Applying settings: Setting expected to be array but got something else: " + ar + " = " + ai);
                    ah = true
                }
                if (ai !== null && ab && !af && !ak) {
                    console.error("Applying settings: Setting expected to be object but got something else: " + ar + " = " + ai);
                    ah = true
                }
                if (ah) {
                    continue
                }
                if (af) {
                    if (!(ae != null)) {
                        if (an) {
                            ap[ar] = [];
                            al[ar] = [];
                            ab = true
                        } else {
                            ap[ar] = {};
                            al[ar] = {};
                            ab = true
                        }
                    }
                    if (ai === null || ai === void 0) {
                        ap[ar] = ai;
                        al[ar] = ai
                    }
                    if (af && !ab) {
                        ap[ar] = {};
                        al[ar] = {}
                    }
                    if (ar === "container") {
                        ap[ar] = ai;
                        al[ar] = ai
                    } else {
                        if (an) {
                            ad = ar + "_applyMethod";
                            if (ao[ad] === "merge" || ap[ad] === "merge") {
                                ac = ap[ar];
                                for (aa = 0, am = ai.length; aa < am; aa++) {
                                    ag = ai[aa];
                                    if (!Q.arrayContains(ac, ag)) {
                                        ac.push(ag)
                                    }
                                }
                            } else {
                                ap[ar] = ai
                            }
                            al[ar] = ai
                        } else {
                            if (!al.hasOwnProperty(ar)) {
                                al[ar] = {}
                            }
                            this.applyRec(ap[ar], ai, al[ar], aq + 1)
                        }
                    }
                } else {
                    if (ai === void 0) {
                        delete ap[ar];
                        al[ar] = ai
                    } else {
                        ap[ar] = ai;
                        al[ar] = ai
                    }
                }
            }
            return 1
        };
        Z.prototype.getAssetUrl = function(aa) {
            if (this.advanced.builtinAssets.hasOwnProperty(aa)) {
                return this.advanced.builtinAssets[aa]
            }
            if (!((this.assetsUrlBase != null) && this.assetsUrlBase.length > 0)) {
                return aa
            }
            if (aa.indexOf("://") !== -1) {
                return aa
            }
            if (aa[0] === "/" || aa.indexOf("./") === 0) {
                return aa
            }
            if (this.assetsUrlBase[this.assetsUrlBase.length - 1] !== "/") {
                return this.assetsUrlBase + "/" + aa
            } else {
                return this.assetsUrlBase + aa
            }
        };
        Z.prototype.getAssetImage = function(ab) {
            var ac, aa;
            if (this._imageCache.hasOwnProperty(ab)) {
                return this._imageCache[ab]
            }
            aa = this.getAssetUrl(ab);
            if (!aa) {
                return null
            }
            ac = this._imageCache[ab] = new Image();
            ac.src = aa;
            if (ac.width > 0) {
                return ac
            } else {
                return null
            }
        };
        return Z
    })();
    var y, u, N, O, Y = {}.hasOwnProperty, m = function(ac, aa) {
        for (var Z in aa) {
            if (Y.call(aa, Z)) {
                ac[Z] = aa[Z]
            }
        }
        function ab() {
            this.constructor = ac
        }
        ab.prototype = aa.prototype;
        ac.prototype = new ab();
        ac.__super__ = aa.prototype;
        return ac
    };
    y = (function() {
        function Z() {
        }
        Z.prototype.image = null;
        Z.prototype.title = null;
        Z.prototype.onclick = null;
        return Z
    })();
    N = (function() {
        Z.prototype.id = "";
        Z.prototype.x = 0;
        Z.prototype.y = 0;
        Z.prototype.isNode = true;
        Z.prototype.isLink = false;
        Z.prototype.removed = false;
        Z.prototype.added = false;
        Z.prototype.data = null;
        Z.prototype.loading = false;
        Z.prototype.links = null;
        Z.prototype.dataLinks = null;
        Z.prototype.userLock = false;
        Z.prototype.expanded = false;
        Z.prototype.runMovingMessage = false;
        Z.prototype.runMovingMessageType = null;
        Z.prototype.id1 = false;
        Z.prototype.id2 = false;
        Z.prototype.focused = false;
        Z.prototype.image = null;
        Z.prototype.imageSlicing = null;
        Z.prototype.radius = 4;
        Z.prototype.label = null;
        Z.prototype.labelStyle = null;
        Z.prototype.labelBackground = null;
        Z.prototype.icons = null;
        Z.prototype.hilight = null;
        Z.prototype.locks = 0;
        Z.prototype.currentRadius = 0;
        function Z(aa) {
            this.id = aa;
            this.links = []
        }
        return Z
    })();
    u = (function() {
        function Z() {
        }
        Z.prototype.from = null;
        Z.prototype.to = null;
        Z.prototype.removed = false;
        Z.prototype.isNode = false;
        Z.prototype.isLink = true;
        Z.prototype.data = null;
        Z.prototype.multiId = null;
        Z.prototype.runMovingMessage = null;        // keren
        Z.prototype.runMovingMessageStepX = null;   // keren
        Z.prototype.runMovingMessageStepY = null;   // keren
        Z.prototype.runMovingMessageType = null;   // keren
        Z.prototype.radius = 1;
        Z.prototype.length = 1;
        Z.prototype.strength = 1;
        Z.prototype.label = null;
        Z.prototype.labelStyle = null;
        Z.prototype.labelBackground = null;
        Z.prototype.dashed = false;
        Z.prototype.currentRadius = 0;
        Z.prototype.direction = null;
        Z.prototype.fromDecoration = null;
        Z.prototype.toDecoration = null;
        Z.prototype.fromIcons = null;
        Z.prototype.toIcons = null;
        Z.prototype.highlight = null;
        Z.prototype.toPieValue = 0;
        Z.prototype.toPieColor = null;
        Z.prototype.toPie0 = null;
        Z.prototype.toPie1 = null;
        Z.prototype.otherEnd = function(aa) {
            if (aa === this.from) {
                return this.to
            }
            if (aa === this.to) {
                return this.from
            }
            return null
        };
        Z.prototype.commonNode = function(aa) {
            if (this.from === aa.from || this.from === aa.to) {
                return this.from
            }
            if (this.to === aa.from || this.to === aa.to) {
                return this.to
            }
            return null
        };
        return Z
    })();
    O = (function(aa) {
        m(Z, aa);
        Z.prototype.settings = null;
        Z.prototype.nodes = [];
        Z.prototype.links = [];
        Z.prototype.idToNode = {};
        Z.prototype.idToLink = {};
        Z.prototype.selection = [];
        Z.prototype.userNodeIds = {};
        Z.prototype.positionedNodeIds = {};
        Z.prototype.activeNode = null;
        Z.prototype.activeLink = null;
        Z.prototype.newNodes = {};
        Z.prototype.newLinks = {};
        Z.prototype.modifiedNodes = {};
        Z.prototype.modifiedLinks = {};
        Z.prototype.deletedNodes = {};
        Z.prototype.deletedLinks = {};
        Z.prototype.enteringNodes = {};
        Z.prototype.enteringLinks = {};
        Z.prototype.exitingNodes = {};
        Z.prototype.exitingLinks = {};
        Z.prototype.centerX = 0;
        Z.prototype.centerY = 0;
        Z.prototype.zoom = 1;
        Z.prototype.layoutActive = true;
        function Z() {
            this.nodes = [];
            this.links = [];
            this.userNodeIds = {};
            this.positionedNodeIds = {};
            this.selection = [];
            this.idToNode = {};
            this.idToLink = {};
            this.multilinks = null;
            this.clearModified()
        }
        Z.prototype.addNode = function(ac) {
            var ab;
            if (this.idToNode.hasOwnProperty(ac)) {
                ab = this.idToNode[ac];
                ab.removed = false;
                if (!ab.added) {
                    ab.added = true
                }
            } else {
                if (this.deletedNodes.hasOwnProperty(ac)) {
                    ab = this.deletedNodes[ac];
                    ab.removed = false;
                    if (!ab.added) {
                        ab.added = true
                    }
                    this.idToNode[ac] = ab;
                    this.nodes.push(ab);
                    delete this.deletedNodes[ac]
                } else {
                    ab = new N(ac);
                    ab.added = true;
                    this.idToNode[ac] = ab;
                    this.nodes.push(ab);
                    this.newNodes[ac] = ab
                }
            }
            this.modifiedNodes[ac] = ab;
            return ab
        };
        Z.prototype.touchNode = function(ab) {
            return this.modifiedNodes[ab.id] = ab
        };
        Z.prototype.removeNode = function(ab) {
            var ac;
            ac = ab.id;
            if (!this.idToNode.hasOwnProperty(ac)) {
                return
            }
            Q.removeFromArray(this.selection, ab);
            if (this.newNodes.hasOwnProperty(ab.id)) {
                return this.deleteNode(ab)
            } else {
                if (!ab.removed) {
                    ab.removed = true
                }
                ab.added = false;
                return this.modifiedNodes[ac] = ab
            }
        };
        Z.prototype.deleteNode = function(ab) {
            Q.removeFromArray(this.selection, ab);
            Q.removeFromArray(this.nodes, ab);
            delete this.newNodes[ab.id];
            delete this.modifiedNodes[ab.id];
            delete this.idToNode[ab.id];
            return this.deletedNodes[ab.id] = ab
        };
        Z.prototype.addLink = function(ac, ae, ad) {
            var ab;
            if (!(this.idToNode.hasOwnProperty(ae) && this.idToNode.hasOwnProperty(ad))) {
                throw"Cannot add link - missing nodes"
            }
            if (this.idToLink.hasOwnProperty(ac)) {
                ab = this.idToLink[ac];
                ab.removed = false;
                if (!ab.added) {
                    ab.added = true
                }
            } else {
                if (this.deletedLinks.hasOwnProperty(ac)) {
                    ab = this.deletedLinks[ac];
                    delete this.deletedLinks[ac];
                    this.idToLink[ac] = ab;
                    this.links.push(ab);
                    ab.removed = false;
                    if (!ab.added) {
                        ab.added = true
                    }
                } else {
                    ab = new u();
                    ab.added = true;
                    ab.id = ac;
                    this.links.push(ab);
                    this.idToLink[ac] = ab;
                    this.newLinks[ac] = ab
                }
            }
            ab.from = null;
            ab.to = null;
            ab.multiId = ae < ad ? ae + "#" + ad : ad + "#" + ae;
            this.modifiedLinks[ac] = ab;
            return ab
        };
        Z.prototype.removeLink = function(ab) {
            var ac;
            ac = ab.id;
            if (!this.idToLink.hasOwnProperty(ac)) {
                return
            }
            if (this.newLinks.hasOwnProperty(ac)) {
                return this.deleteLink(ab)
            } else {
                ab.added = false;
                if (!ab.removed) {
                    ab.removed = true
                }
                return this.modifiedLinks[ac] = ab
            }
        };
//        Z.prototype.runMovingMessage = function(direction) {	// keren
//            // running animated circle as a message
//            if (direction == "left") {
//                return
//            } else {
//                return
//            }
//        };
        Z.prototype.deleteLink = function(ab) {
            Q.removeFromArray(this.links, ab);
            if (this.newLinks.hasOwnProperty(ab.id)) {
                delete this.newLinks[ab.id]
            } else {
                this.deletedLinks[ab.id] = ab
            }
            delete this.modifiedLinks[ab.id];
            return delete this.idToLink[ab.id]
        };
        Z.prototype.touchLink = function(ab) {
            return this.modifiedLinks[ab.id] = ab
        };
        Z.prototype.getModified = function() {
            return[this.newNodes, this.newLinks, this.modifiedNodes, this.modifiedLinks, this.deletedNodes, this.deletedLinks]
        };
        Z.prototype.hasTopologyChanges = function() {
            return Q.hasProperties(this.newNodes) || Q.hasProperties(this.newLinks) || Q.hasProperties(this.deletedNodes) || Q.hasProperties(this.deletedLinks)
        };
        Z.prototype.hasStyleChanges = function() {
            return this.hasTopologyChanges() || Q.hasProperties(this.modifiedLinks) || Q.hasProperties(this.modifiedNodes)
        };
        Z.prototype.clearModified = function() {
            this.newNodes = {};
            this.newLinks = {};
            this.modifiedNodes = {};
            this.modifiedLinks = {};
            this.deletedNodes = {};
            return this.deletedLinks = {}
        };
        Z.prototype.xyInChart = function(ab, ac) {
            return(ab >= this.x0) && (ab < this.x0 + this.width) && (ac >= this.y0) && (ac < this.y0 + this.height)
        };
        Z.prototype.toDisplay = function(ab, ac) {
            return[(ab - this.centerX) * this.zoom + this.x0 + this.width * 0.5, (ac - this.centerY) * this.zoom + this.y0 + this.height * 0.5]
        };
        Z.prototype.fromDisplay = function(ab, ac) {
            return[(ab - this.x0 - this.width * 0.5) / this.zoom + this.centerX, (ac - this.y0 - this.height * 0.5) / this.zoom + this.centerY]
        };
        Z.prototype.toDisplayTransform = function(ab, ac) {
            return[this.zoom, this.x0 + this.width * 0.5 - this.centerX * this.zoom, this.zoom, this.y0 + this.height * 0.5 - this.centerY * this.zoom]
        };
        Z.prototype.setActiveObject = function(ab) {
            if (this.activeNode != null) {
                this.touchNode(this.activeNode)
            }
            if (this.activeLink != null) {
                this.touchLink(this.activeLink)
            }
            this.activeNode = null;
            this.activeLink = null;
            if (ab instanceof N) {
                this.activeNode = ab;
                return this.touchNode(this.activeNode)
            } else {
                if (ab instanceof u) {
                    this.activeLink = ab;
                    return this.touchLink(this.activeLink)
                } else {
                    if (ab !== null) {
                        throw"scene.setActiveObject invalid active object type " + ab
                    }
                }
            }
        };
        Z.prototype.getChartBounds = function() {
            return{left: this.x0, top: this.y0, right: this.x0 + this.width, bottom: this.y0 + this.height}
        };
        Z.prototype.getVisibleBounds = function() {
            var ad, ac, af, ae, ag, ab;
            ag = this.fromDisplay(this.x0, this.y0), ad = ag[0], af = ag[1];
            ab = this.fromDisplay(this.x0 + this.width, this.y0 + this.height), ac = ab[0], ae = ab[1];
            return[ad, af, ac, ae]
        };
        Z.prototype.getGraphBounds = function() {
            var ae, ab, ak, ad, ac, ah, al, aj, af, ai, ag;
            if (this.nodes.length === 0) {
                return[0, 0, 0, 0]
            }
            ad = Infinity;
            ac = -Infinity;
            al = Infinity;
            aj = -Infinity;
            ag = this.nodes;
            for (af = 0, ai = ag.length; af < ai; af++) {
                ae = ag[af];
                if (ae.removed) {
                    continue
                }
                ak = ae.x;
                ah = ae.y;
                ab = ae.currentRadius;
                if (ae.renderRadius) {
                    ab = ae.renderRadius
                }
                ab = ab * 1.2;
                ad = Math.min(ad, ak - ab);
                ac = Math.max(ac, ak + ab);
                al = Math.min(al, ah - ab);
                aj = Math.max(aj, ah + ab)
            }
            return[ad, al, ac, aj]
        };
        Z.prototype.findNodeAt = function(am, al, an) {
            var ag, ak, ac, ai, ad, ab, ae, aq, ao, ah, ap, aj, af;
            aj = this.fromDisplay(am, al), aq = aj[0], ao = aj[1];
            ai = an;
            ag = null;
            af = this.nodes;
            for (ah = 0, ap = af.length; ah < ap; ah++) {
                ad = af[ah];
                if (ad.removed) {
                    continue
                }
                ab = ad.targetRadius;
                ak = (aq - ad.x) * (aq - ad.x) + (ao - ad.y) * (ao - ad.y);
                ae = (ab + ai) * (ab + ai);
                if (ak < ae) {
                    ac = ab * ab;
                    if (ak < ac) {
                        return ad
                    } else {
                        ai = Math.sqrt(ak) - ab
                    }
                }
            }
            return ag
        };
        Z.prototype.findLinkOrNodeAt = function(aB, az, au) {
            var aj, ai, af, ao, ay, at, ar, aq, ap, av, an, ax, aw, am, ak, ah, ad, ab, aA, aC, al, ag, ae, ac;
            al = this.fromDisplay(aB, az), an = al[0], am = al[1];
            ar = au;
            aj = null;
            ag = this.nodes;
            for (ad = 0, aA = ag.length; ad < aA; ad++) {
                aq = ag[ad];
                if (aq.removed) {
                    continue
                }
                ap = aq.targetRadius;
                ao = (an - aq.x) * (an - aq.x) + (am - aq.y) * (am - aq.y);
                av = (ap + ar) * (ap + ar);
                if (ao < av) {
                    ay = ap * ap;
                    if (ao < ay) {
                        return aq
                    } else {
                        ar = Math.sqrt(ao) - ap;
                        aj = aq
                    }
                }
            }
            ae = this.links;
            for (ab = 0, aC = ae.length; ab < aC; ab++) {
                at = ae[ab];
                if (at.removed) {
                    continue
                }
                ap = at.targetRadius;
                ax = at.from.x;
                ak = at.from.y;
                aw = at.to.x;
                ah = at.to.y;
                ac = a.closestPointToLine(ax, ak, aw, ah, an, am), ai = ac[0], af = ac[1];
                ao = (an - ai) * (an - ai) + (am - af) * (am - af);
                av = (ap + ar) * (ap + ar);
                if (ao < av) {
                    ar = Math.sqrt(ao) - ap;
                    aj = at
                }
            }
            return aj
        };
        Z.prototype.updateMultilinks = function() {
            var ac, ae, ah, ad, ag, ab, af;
            if (!this.hasTopologyChanges()) {
                return
            }
            ad = {};
            af = this.links;
            for (ag = 0, ab = af.length; ag < ab; ag++) {
                ae = af[ag];
                ah = ae.multiId;
                if (!ad.hasOwnProperty(ah)) {
                    ad[ah] = ae
                } else {
                    ac = ad[ah];
                    if (ac.length != null) {
                        ac.push(ae)
                    } else {
                        ad[ah] = [ad[ah], ae]
                    }
                }
            }
            return this.multilinks = ad
        };
        return Z
    })(C);
    var B;
    B = (function() {
        Z.prototype.animationPriority = 1000;
        function Z(aa) {
            this.chart = aa;
            this.scene = aa.scene;
            this.time = null;
            this.idleSince = null;
            this.nodeMap = null;
            this.random = new f(1);
            this.springs = new H(this.random)
        }
        Z.prototype.doAnimations = function(aa) {
            var ae, ak, ac, ad, ab, ai, ah, af, al, aj, ag;
            this.settings = this.scene.settings.layout;
            ai = this.settings.layoutFreezeTimeout;
            if (!this.time || this.time + ai < aa.time) {
                ac = 30
            } else {
                ac = Math.min(1000, aa.time - this.time)
            }
            this.time = aa.time;
            ak = this.animateChanges(aa.time, ac);
            aj = this.scene.hasTopologyChanges();
            al = this.scene.hasStyleChanges();
            if (ak || aj || aa.changes.coordinates || aa.changes.layout || this.idleSince === null || aa.changes.bounds) {
                this.idleSince = this.time
            }
            af = {};
            ah = false;
            if (aj) {
                this.random = new f(1);
                ag = this.placeNewNodes(), af = ag[0], ah = ag[1]
            }
            ad = this.settings.layoutMode === "dynamic";
            if ((ad || ak) && this.idleSince + ai > this.time) {
                ab = (this.time - this.idleSince) / ai;
                ae = 1 - Math.pow(Math.max(0, (ab - 0.5) * 2), 2);
                this.doLayout(aa.time, ac * ae, aj | aa.changes.layout, al, af, 500, ah, ad);
                this.placePies();
                aa.animating = true
            }
            if (ak) {
                return aa.animating = true
            }
        };
        Z.prototype.animateChanges = function(aj, an) {
            var ao, ad, ai, ac, ar, ak, am, ap, aq, ah, af, ae, ab, aa, au, aw, av, at, al, ag;
            ao = false;
            ai = this.settings.fadeTime;
            ad = Math.max(0, Math.pow(0.2, an / ai));
            ac = 0.01;
            ah = [];
            am = [];
            al = this.scene.nodes;
            for (af = 0, au = al.length; af < au; af++) {
                aq = al[af];
                if (aq.added === true) {
                    aq.added = aj
                }
                if (aq.added + ai < aj) {
                    aq.added = false
                }
                if (aq.removed === true) {
                    aq.removed = aj
                }
                if (aq.removed) {
                    ao = true;
                    aq.currentRadius = aq.currentRadius * ad;
                    if (aq.removed + ai < aj) {
                        ah.push(aq)
                    }
                } else {
                    if (aq.targetRadius !== aq.currentRadius) {
                        ao = true;
                        aq.currentRadius = aq.currentRadius * ad + aq.targetRadius * (1 - ad);
                        if (Math.abs(aq.currentRadius - aq.targetRadius) < ac * aq.targetRadius) {
                            aq.currentRadius = aq.targetRadius
                        }
                    }
                }
            }
            ag = this.scene.links;
            for (ae = 0, aw = ag.length; ae < aw; ae++) {
                ak = ag[ae];
                if (ak.added === true) {
                    ak.added = aj
                }
                if (ak.added + ai < aj) {
                    ak.added = false
                }
                if (ak.removed === true) {
                    ak.removed = aj
                }
                if (ak.removed) {
                    ao = true;
                    ak.currentRadius = ak.currentRadius * ad;
                    if (ak.removed + ai < aj) {
                        am.push(ak)
                    }
                } else {
                    if (ak.targetRadius !== ak.currentRadius) {
                        ao = true;
                        ak.currentRadius = ak.currentRadius * ad + ak.targetRadius * (1 - ad);
                        if (Math.abs(ak.currentRadius - ak.targetRadius) < ac * ak.targetRadius) {
                            ak.currentRadius = ak.targetRadius
                        }
                    }
                }
            }
            for (ab = 0, av = am.length; ab < av; ab++) {
                ar = am[ab];
                this.scene.deleteLink(ar)
            }
            for (aa = 0, at = ah.length; aa < at; aa++) {
                ap = ah[aa];
                this.scene.deleteNode(ap)
            }
            return ao
        };
        Z.prototype.resetLayout = function() {
            var ae, ab, ad, aa, ac;
            this.random = new f(1);
            this.springs.random = this.random;
            ab = {};
            ac = this.scene.nodes;
            for (ad = 0, aa = ac.length; ad < aa; ad++) {
                ae = ac[ad];
                ab[ae.id] = ae;
                ae.x = 0;
                ae.y = 0;
                ae.userLock = false
            }
            this.doLayout(new Date().getTime(), 1, true, true, ab, 10000, true);
            return this.idleSince = null
        };
        Z.prototype.placeNewNodes = function() {
            var al, aj, ah, ar, ap, at, ay, am, ak, aw, an, av, aq, af, ax, aA, az, au, ae, ac, ab, aa, aC, aE, aD, aB, ao, ai, ag, ad;
            aq = {};
            ak = false;
            ao = this.scene.nodes;
            for (ae = 0, aC = ao.length; ae < aC; ae++) {
                aw = ao[ae];
                if (aw.x === 0 && aw.y === 0) {
                    aq[aw.id] = true
                }
            }
            ai = this.scene.nodes;
            for (ac = 0, aE = ai.length; ac < aE; ac++) {
                aw = ai[ac];
                au = 1;
                if (aq.hasOwnProperty(aw.id)) {
                    av = 0;
                    aj = 0;
                    ah = 0;
                    au = 1;
                    ag = aw.links;
                    for (ab = 0, aD = ag.length; ab < aD; ab++) {
                        am = ag[ab];
                        af = am.otherEnd(aw);
                        if (!aq.hasOwnProperty(af.id)) {
                            an = af;
                            aj += af.x;
                            ah += af.y;
                            av += 1
                        }
                    }
                    if (av > 1) {
                        aA = aj / av;
                        az = ah / av;
                        au = 0.5
                    } else {
                        if (av === 1) {
                            al = 0;
                            ar = 0;
                            ap = 0;
                            ad = an.links;
                            for (aa = 0, aB = ad.length; aa < aB; aa++) {
                                am = ad[aa];
                                ax = am.otherEnd(an);
                                if (ax === aw || aq.hasOwnProperty(ax.id)) {
                                    continue
                                }
                                ar += ax.x - an.x;
                                ap += ax.y - an.y;
                                al += 1
                            }
                            if (al > 0) {
                                ay = Math.sqrt(ar * ar + ap * ap);
                                if (ay > 0) {
                                    at = 1 / (ay * al);
                                    ar *= at;
                                    ap *= at;
                                    aA = an.x - ar * an.currentRadius * 1.2;
                                    az = an.y - ap * an.currentRadius * 1.2;
                                    au = 0.2
                                } else {
                                    aA = an.x;
                                    az = an.y
                                }
                            } else {
                                ak = true;
                                aA = an.x;
                                az = an.y
                            }
                        } else {
                            ak = true;
                            aA = 0;
                            az = 0
                        }
                    }
                    aw.x = aA + (this.random.get() - 0.5) * au * (aw.currentRadius + 1);
                    aw.y = az + (this.random.get() - 0.5) * au * (aw.currentRadius + 1)
                }
            }
            return[aq, ak]
        };
        Z.prototype.placePies = function() {
            var aa, ao, aj, an, am, al, ai, ap, ag, af, ad, ac, ab, aq, au, at, ar, ak, ah, ae;
            aa = Math.PI * 2;
            ap = [];
            ak = this.scene.nodes;
            ae = [];
            for (af = 0, aq = ak.length; af < aq; af++) {
                am = ak[af];
                ag = 0;
                ah = am.links;
                for (ad = 0, au = ah.length; ad < au; ad++) {
                    aj = ah[ad];
                    if (aj.to === am && aj.toPieValue > 0) {
                        ag += aj.toPieValue;
                        ap.push(aj);
                        aj._angle = Math.atan2(aj.to.y - aj.from.y, aj.to.x - aj.from.x)
                    }
                }
                if (ag > 0) {
                    ap.sort(function(aw, av) {
                        return aw._angle - av._angle
                    });
                    an = aa / ag;
                    ao = 0;
                    ai = 0;
                    for (ac = 0, at = ap.length; ac < at; ac++) {
                        aj = ap[ac];
                        aj.toPie0 = ao;
                        ao += aj.toPieValue * an;
                        aj.toPie1 = ao;
                        al = aj._angle - (aj.toPie0 + aj.toPie1) / 2;
                        if (al < 0) {
                            al += Math.PI * 2
                        }
                        ai += al
                    }
                    ai /= ap.length;
                    ai -= Math.PI;
                    for (ab = 0, ar = ap.length; ab < ar; ab++) {
                        aj = ap[ab];
                        aj.toPie0 += ai;
                        aj.toPie1 += ai
                    }
                    ae.push(ap = [])
                } else {
                    ae.push(void 0)
                }
            }
            return ae
        };
        Z.prototype.doLayout = function(am, ar, ad, aC, ap, ao, aE, ax) {
            var ae, at, ai, ak, aq, ay, aj, aA, au, al, aw, aB, av, ah, ag, aD, az, af, ac, ab, aa, aG, aI, aH, aF, an;
            if (aE == null) {
                aE = false
            }
            if (ax == null) {
                ax = true
            }
            ak = this.scene.settings.layout.fadeTime;
            at = null;
            if (this.scene.settings.interaction.zooming.autoZoom) {
                at = (this.scene.width + 1) / (this.scene.height + 1)
            }
            aB = this.settings.nodeSpacing;
            ai = 1;
            av = this.scene.nodes;
            ae = false;
            for (af = 0, aG = av.length; af < aG; af++) {
                aw = av[af];
                aw.locked = aw.userLock || aw.locks > 0;
                ae || (ae = aw.added || aw.removed);
                if (aw.added) {
                    aw.visibility = 1 - 0.8 * (am - aw.added) / ak
                } else {
                    if (aw.removed) {
                        aw.visibility = 0.2 + 0.8 * (am - aw.removed) / ak
                    } else {
                        aw.visibility = 1
                    }
                }
            }
            al = {};
            ah = [];
            an = this.scene.links;
            for (ac = 0, aI = an.length; ac < aI; ac++) {
                ay = an[ac];
                au = ay.multiId;
                aD = ay.strength;
                aj = ay.length;
                az = 1;
                if (ay.removed || ay.added) {
                    aq = ay.from.links.length > 1 && ay.to.links.length > 1;
                    if (aq || ay.removed) {
                        ag = 0.2
                    } else {
                        ag = aD
                    }
                    if (ay.removed) {
                        az = 1 - (am - ay.removed) / ak
                    }
                    if (ay.added) {
                        az = (am - ay.added) / ak;
                        aj = 0.2 + (aj - 0.2) * az
                    }
                    aD = aD * az + ag * (1 - az)
                }
                if (!al.hasOwnProperty(au)) {
                    aA = {from: ay.from, to: ay.to, strength: aD, length: aj, visibility: az};
                    al[au] = aA;
                    ah.push(aA)
                } else {
                    aA = al[au];
                    aA.strength = Math.max(aD, aA.strength);
                    aA.length = Math.max(aj, aA.length);
                    aA.visibility = Math.max(az, aA.visibility)
                }
            }
            this.springs.updateParams(aB, ai, at);
            if (aE || Q.hasProperties(ap)) {
                for (ab = 0, aH = av.length; ab < aH; ab++) {
                    aw = av[ab];
                    aw.locked || (aw.locked = !ap.hasOwnProperty(aw.id))
                }
                this.springs.updateGraph(av, ah, ad);
                if (aE || this.scene.settings.layout.globalLayoutOnChanges) {
                    this.springs.globalLayout(av, ao, aE)
                } else {
                    this.springs.timedLayout(av, ar * 0.001)
                }
            }
            if (ax || ae) {
                if (!ax) {
                    for (aa = 0, aF = av.length; aa < aF; aa++) {
                        aw = av[aa];
                        aw.locked || (aw.locked = !aw.removed && !aw.added)
                    }
                }
                this.springs.updateGraph(av, ah, ad);
                return this.springs.timedLayout(av, ar * 0.001)
            }
        };
        return Z
    })();
    var I;
    I = (function() {
        Z.prototype.scene = null;
        Z.prototype.container = null;
        Z.prototype.background = null;
        Z.prototype.canvas = null;
        Z.prototype.outerBorder = null;
        Z.prototype.mouseTrackLayer = null;
        function Z(aa) {
            this.scene = aa;
            this.container = Q.createDom("div", "TimeChart-container");
            this.container.style.position = "relative";
            this.container.style.width = "100%";
            this.container.style.height = "100%";
            this.background = Q.createDom("div", "TimeChart-background", null, this.container);
            this.setContainerStyle(this.background);
            this.canvas = Q.createDom("canvas", "NetChart-canvas", null, this.container);
            this.setContainerStyle(this.canvas);
            this.outerBorder = Q.createDom("div", "TimeChart-border", null, this.container);
            this.setContainerStyle(this.outerBorder);
            this.resizerBar = Q.createDom("div", "TimeChart-resizer", null, this.container);
            this.mouseTrackLayer = Q.createDom("div", null, null, this.container);
            this.setContainerStyle(this.mouseTrackLayer);
            this.updateSettings(this.scene.settings, "init");
            this.updateSize()
        }
        Z.prototype.updateSize = function() {
            var aa, ab;
            ab = this.scene.settings.width;
            aa = this.scene.settings.height;
            if (this.scene.chartWidth > this.scene.settings.container.clientWidth) {
                ab = this.scene.chartWidth
            }
            if (this.scene.chartHeight > this.scene.settings.container.clientHeight) {
                aa = this.scene.chartHeight
            }
            if (ab) {
                this.container.style.width = "" + ab + "px"
            }
            if (aa) {
                this.container.style.height = "" + aa + "px"
            }
            this.resizerBar.style.width = "" + this.scene.width + "px";
            return this.resizerBar.style.left = "" + this.scene.x0 + "px"
        };
        Z.prototype.updateSettings = function(aa) {
            if (Q.hasProp(aa, "advanced/themeCSSClass")) {
                if (this.curTheme != null) {
                    Q.removeClass(this.container, this.curTheme)
                }
                this.curTheme = this.scene.settings.advanced.themeCSSClass;
                return Q.addClass(this.container, this.curTheme)
            }
        };
        Z.prototype.setContainerStyle = function(aa) {
            aa.style.position = "absolute";
            aa.style.left = "0px";
            aa.style.right = "0px";
            aa.style.top = "0px";
            return aa.style.bottom = "0px"
        };
        return Z
    })();
    var A;
    A = (function() {
        Z.prototype.animationPriority = 1003;
        function Z(aa) {
            this.chart = aa;
            this.scene = aa.scene;
            this.time = null
        }
        Z.prototype.sortRules = function(ad) {
            var ab, ac, aa;
            ac = (function() {
                var ae;
                ae = [];
                for (ab in ad) {
                    aa = ad[ab];
                    ae.push(ab)
                }
                return ae
            })();
            ac.sort();
            return(function() {
                var ag, af, ae;
                ae = [];
                for (ag = 0, af = ac.length; ag < af; ag++) {
                    ab = ac[ag];
                    ae.push(ad[ab])
                }
                return ae
            })()
        };
        Z.prototype.doAnimations = function(aa) {
            var an, am, aj, al, ad, ao, ah, ag, ak, ab, ai, af, ae, ac;
            if (!(aa.changes.settings || Q.hasProperties(this.scene.modifiedNodes) || Q.hasProperties(this.scene.modifiedLinks))) {
                return
            }
            this.nodeRules = this.sortRules(this.scene.settings.style.nodeRules);
            this.linkRules = this.sortRules(this.scene.settings.style.linkRules);
            this.nodeRadiusChanged = Q.hasProperties(this.scene.newNodes) | Q.hasProperties(this.scene.deletedNodes);
            this.linkRadiusChanged = Q.hasProperties(this.scene.newLinks) | Q.hasProperties(this.scene.deletedLinks);
            if (aa.changes.settings) {
                this.nodeRadiusChanged = true;
                this.linkRadiusChanged = true;
                ai = this.scene.nodes;
                for (ah = 0, ak = ai.length; ah < ak; ah++) {
                    ad = ai[ah];
                    this.updateNode(ad)
                }
                af = this.scene.links;
                for (ag = 0, ab = af.length; ag < ab; ag++) {
                    aj = af[ag];
                    this.updateLink(aj)
                }
            } else {
                ae = this.scene.modifiedNodes;
                for (an in ae) {
                    ao = ae[an];
                    this.updateNode(ao)
                }
                ac = this.scene.modifiedLinks;
                for (am in ac) {
                    al = ac[am];
                    this.updateLink(al)
                }
            }
            if (this.nodeRadiusChanged) {
                this.computeRadiuses(this.scene.nodes, this.scene.settings.style.nodeAutoScaling, this.scene.settings.style.nodeRadiusExtent)
            }
            if (this.linkRadiusChanged) {
                return this.computeRadiuses(this.scene.links, this.scene.settings.style.linkAutoScaling, this.scene.settings.style.linkRadiusExtent)
            }
        };
        Z.prototype.updateNode = function(ac) {
            var ag, ab, af, ae, aa, ad;
            ag = ac === this.scene.activeNode;
            af = ac.radius;
            Q.extend(ac, this.scene.settings.style.node);
            if (!ac.radius) {
                ac.radius = 4
            }
            ac.label = ac.id;
            ac.labelStyle = this.scene.settings.style.nodeLabel;
            ac.labelBackground = this.scene.settings.style.nodeLabelBalloon;
            if (ac.userLock) {
                Q.extend(ac, this.scene.settings.style.nodeLocked)
            }
            if (ac.expanded) {
                Q.extend(ac, this.scene.settings.style.nodeExpanded)
            }
            if (ac.focused) {
                Q.extend(ac, this.scene.settings.style.nodeFocused)
            }
            if (ac.data) {
                if (ac.data.error != null) {
                    ac.label = ac.data.error;
                    ac.fillColor = "red"
                }
                if (ac.data.style) {
                    Q.extend(ac, ac.data.style)
                }
                this.applyStyleRules(ac, this.nodeRules);
                if (!Q.isNumber(ac.radius)) {
                    ac.radius = 4
                }
            }
            if (ac.removed) {
                ac.fillColor = this.scene.settings.style.removedColor
            }
            if (ag) {
                Q.extend(ac, this.scene.settings.style.hoverStyle)
            }
            ad = ac.links;
            for (ae = 0, aa = ad.length; ae < aa; ae++) {
                ab = ad[ae];
                this.updateLink(ab)
            }
            if (af !== ac.radius) {
                this.nodeRadiusChanged = true
            }
            return true
        };
        Z.prototype.updateLink = function(aa) {
            var ac, ab;
            ab = aa.radius;
            Q.extend(aa, this.scene.settings.style.link);
            aa.label = null;
            aa.labelStyle = this.scene.settings.style.linkLabel;
            aa.labelBackground = this.scene.settings.style.linkLabelBalloon;
            aa.radius = 1;
            ac = aa === this.scene.activeLink || aa.from === this.scene.activeNode || aa.to === this.scene.activeNode;
            if (aa.data.style) {
                Q.extend(aa, aa.data.style)
            }
            this.applyStyleRules(aa, this.linkRules);
            if (!Q.isNumber(aa.radius)) {
                aa.radius = 1
            }
            if (ac) {
                Q.extend(aa, this.scene.settings.style.hoverStyle);
                if (aa.from === this.scene.activeNode) {
                    aa.toPieColor = aa.fillColor
                }
            }
            if (aa.removed) {
                aa.fillColor = this.scene.settings.style.removedColor
            }
            if (ab !== aa.radius) {
                return this.linkRadiusChanged = true
            }
        };
        Z.prototype.applyStyleRules = function(ae, af) {
            var ac, ad, ab, aa;
            aa = [];
            for (ad = 0, ab = af.length; ad < ab; ad++) {
                ac = af[ad];
                aa.push(ac(ae))
            }
            return aa
        };
        Z.prototype.computeRadiuses = function(ab, an, aq) {
            var ao, ar, aj, ap, al, at, am, ag, ae, ad, ac, aw, ay, ax, av, au, aa, af, ak, ai, ah;
            al = aq[0], aj = aq[1];
            if (an === "linear" || an === "logarithmic") {
                ap = Infinity;
                ar = -Infinity;
                for (ag = 0, aw = ab.length; ag < aw; ag++) {
                    am = ab[ag];
                    if (!am.removed) {
                        ap = Math.min(ap, am.radius);
                        ar = Math.max(ar, am.radius)
                    }
                }
                if (ap >= ar) {
                    af = [];
                    for (ae = 0, ay = ab.length; ae < ay; ae++) {
                        am = ab[ae];
                        if (!am.removed) {
                            af.push(am.targetRadius = al)
                        } else {
                            af.push(void 0)
                        }
                    }
                    return af
                } else {
                    if (an === "linear") {
                        at = (aj - al) / (ar - ap);
                        ao = aj - ar * at;
                        ak = [];
                        for (ad = 0, ax = ab.length; ad < ax; ad++) {
                            am = ab[ad];
                            if (!am.removed) {
                                ak.push(am.targetRadius = am.radius * at + ao)
                            } else {
                                ak.push(void 0)
                            }
                        }
                        return ak
                    } else {
                        ap = Math.max(0.0001, ap);
                        ar = Math.max(ap + 0.0001, ar);
                        at = (aj - al) / Math.log(ar / ap);
                        ao = aj - at * Math.log(ar);
                        ai = [];
                        for (ac = 0, av = ab.length; ac < av; ac++) {
                            am = ab[ac];
                            if (!am.removed) {
                                ai.push(am.targetRadius = Math.log(Math.max(0.0001, am.radius)) * at + ao)
                            } else {
                                ai.push(void 0)
                            }
                        }
                        return ai
                    }
                }
            } else {
                ah = [];
                for (aa = 0, au = ab.length; aa < au; aa++) {
                    am = ab[aa];
                    if (!am.removed) {
                        ah.push(am.targetRadius = Math.min(Math.max(al, am.radius), aj))
                    } else {
                        ah.push(void 0)
                    }
                }
                return ah
            }
        };
        return Z
    })();
    var V, i = this;
    V = (function() {
        function Z(ac) {
            var aa, ab, ae, ad, af = this;
            this.chart = ac;
            this.freeze = function(ag) {
                return Z.prototype.freeze.apply(af, arguments)
            };
            this.resetLayout = function(ag) {
                return Z.prototype.resetLayout.apply(af, arguments)
            };
            this.zoomToFit = function(ag) {
                return Z.prototype.zoomToFit.apply(af, arguments)
            };
            this.zoomMove = function(ag) {
                return Z.prototype.zoomMove.apply(af, arguments)
            };
            this.zoomDown = function(ag) {
                return Z.prototype.zoomDown.apply(af, arguments)
            };
            this.scene = ac.scene;
            this.events = ac.events;
            this.scrolling = this.chart.scrolling;
            aa = Q.createDom("div", "NC-zoom", null, this.chart.layers.container);
            ad = Q.createDom("span", null, null, aa);
            this.handle = Q.createDom("em", null, null, ad);
            ae = Q.createDom("nav", null, null, aa);
            this.fit = Q.createDom("a", "NC-zoom-fit", "Fit to screen", ae);
            this.fit.title = "Fit to screen";
            this.rearrange = Q.createDom("a", "NC-zoom-rearrange", "Rearrange elements", ae);
            this.rearrange.title = "Rearrange elements";
            this.lock = Q.createDom("a", "NC-zoom-lock-all", "Locak all", ae);
            this.lock.title = "Lock all";
            this.lock.onclick = this.freeze;
            this.rearrange.onclick = this.resetLayout;
            this.fit.onclick = this.zoomToFit;
            ab = new s(aa, this.scene.settings.advanced.pointer);
            ab.listen("drag", this.zoomMove);
            ab.listen("down", this.zoomDown)
        }
        Z.prototype.zoomDown = function(aa) {
            if (aa.y < 100) {
                return this.zoomMove(aa)
            }
        };
        Z.prototype.zoomMove = function(ab) {
            var aa, ac;
            ac = ab.y - 10;
            ac = Math.max(0, Math.min(80, ac));
            this.handle.style.top = "" + ac + "px";
            aa = this.getZoomValue(ac / 80);
            this.scrolling.zoom(aa / this.scene.zoom);
            this.events.notifySceneChanges({position: true});
            return ab.consumed = true
        };
        Z.prototype.getSliderPosition = function() {
            var aa, ab, ac, ad;
            ad = this.scene.settings.interaction.zooming.zoomExtent, ab = ad[0], aa = ad[1];
            ab = Math.log(ab);
            aa = Math.log(aa);
            ac = Math.log(this.scene.zoom);
            return 1 - (ac - ab) / (aa - ab)
        };
        Z.prototype.getZoomValue = function(ae) {
            var aa, ab, ad, ac;
            ac = this.scene.settings.interaction.zooming.zoomExtent, ab = ac[0], aa = ac[1];
            ab = Math.log(ab);
            aa = Math.log(aa);
            ad = (1 - ae) * (aa - ab) + ab;
            return Math.exp(ad)
        };
        Z.prototype.zoomToFit = function(aa) {
            if (this.scene.settings.interaction.zooming.autoZoom) {
                this.scene.settings.interaction.zooming.autoZoom = false
            } else {
                this.scene.settings.interaction.zooming.autoZoom = true;
                this.events.notifySceneChanges({position: true})
            }
            return aa.preventDefault()
        };
        Z.prototype.resetLayout = function(aa) {
            this.chart.layout.resetLayout();
            this.scene.settings.layout.layoutMode = "dynamic";
            this.scene.settings.interaction.zooming.autoZoom = true;
            this.chart.scrolling.zoomToFit();
            this.events.notifySceneChanges({position: true, layout: true});
            return aa.preventDefault()
        };
        Z.prototype.freeze = function(aa) {
            if (this.scene.settings.layout.layoutMode === "dynamic") {
                this.scene.settings.layout.layoutMode = "static"
            } else {
                this.scene.settings.layout.layoutMode = "dynamic"
            }
            this.events.notifySceneChanges({layout: true});
            return aa.preventDefault()
        };
        Z.prototype.doAnimations = function(aa) {
            var ab;
            ab = this.getSliderPosition();
            this.handle.style.top = "" + (80 * ab) + "px";
            if (this.scene.settings.interaction.zooming.autoZoom) {
                Q.setClass(this.fit, "NC-zoom-fit-active")
            } else {
                Q.setClass(this.fit, "NC-zoom-fit")
            }
            if (this.scene.settings.layout.layoutMode === "dynamic") {
                return Q.setClass(this.lock, "NC-zoom-lock-all")
            } else {
                return Q.setClass(this.lock, "NC-zoom-lock-all-active")
            }
        };
        return Z
    })();
    var r, W, h, i = this;
    h = (function() {
        function Z() {
        }
        Z.prototype.time = 0;
        Z.prototype.animating = false;
        Z.prototype.changes = {};
        return Z
    })();
    r = (function() {
        function Z() {
        }
        Z.prototype.animationPriority = 0;
        Z.prototype.remove = function() {
            return false
        };
        Z.prototype.doAnimations = function(aa) {
            return false
        };
        Z.prototype.paintScene = function(aa) {
            return false
        };
        Z.prototype.onSceneChange = function(aa) {
            return false
        };
        Z.prototype.onClick = function(aa) {
            return false
        };
        Z.prototype.onRClick = function(aa) {
            return false
        };
        Z.prototype.onDoubleClick = function(aa) {
            return false
        };
        Z.prototype.onPointerDown = function(aa) {
            return false
        };
        Z.prototype.onPointerUp = function(aa) {
            return false
        };
        Z.prototype.onPointerDrag = function(aa) {
            return false
        };
        Z.prototype.onPointerMove = function(aa) {
            return false
        };
        Z.prototype.onPointerOut = function(aa) {
            return false
        };
        Z.prototype.onWheel = function(aa) {
            return false
        };
        Z.prototype.onKeyDown = function(aa) {
            return false
        };
        Z.prototype.previewWheel = function(aa) {
            return false
        };
        Z.prototype.previewPointerDown = function(aa) {
            return false
        };
        Z.prototype.previewPointerUp = function(aa) {
            return false
        };
        Z.prototype.previewPointerDrag = function(aa) {
            return false
        };
        Z.prototype.previewPointerMove = function(aa) {
            return false
        };
        Z.prototype.previewPointerOut = function(aa) {
            return false
        };
        return Z
    })();
    W = (function() {
        Z.prototype.container = null;
        Z.prototype.paintRequested = false;
        Z.prototype.mouseEvents = null;
        function Z(aa, ab, ac) {
            var ad = this;
            this.container = aa;
            this.canvas = ab;
            this.chart = ac;
            this._paintScene = function() {
                return Z.prototype._paintScene.apply(ad, arguments)
            };
            this.kd = function(ae) {
                return Z.prototype.kd.apply(ad, arguments)
            };
            this.mw = function(ae) {
                return Z.prototype.mw.apply(ad, arguments)
            };
            this.mdbl = function(ae) {
                return Z.prototype.mdbl.apply(ad, arguments)
            };
            this.rcl = function(ae) {
                return Z.prototype.rcl.apply(ad, arguments)
            };
            this.mcl = function(ae) {
                return Z.prototype.mcl.apply(ad, arguments)
            };
            this.mlve = function(ae) {
                return Z.prototype.mlve.apply(ad, arguments)
            };
            this.mmve = function(ae) {
                return Z.prototype.mmve.apply(ad, arguments)
            };
            this.mdrg = function(ae) {
                return Z.prototype.mdrg.apply(ad, arguments)
            };
            this.mup = function(ae) {
                return Z.prototype.mup.apply(ad, arguments)
            };
            this.mdwn = function(ae) {
                return Z.prototype.mdwn.apply(ad, arguments)
            };
            this.scene = this.chart.scene;
            this.settings = this.chart.settings;
            this.elements = [];
            this.elementsReverse = [];
            this.pointerToElement = {};
            this.sceneChanges = {};
            this.animationOrder = [];
            this.hooks = {};
            this.mouseEvents = new s(this.container, this.settings.advanced.pointer, this.chart, this.whiteList);
            this.mouseEvents.listen(this.mouseEvents.EVENT_DOWN, this.mdwn);
            this.mouseEvents.listen(this.mouseEvents.EVENT_UP, this.mup);
            this.mouseEvents.listen(this.mouseEvents.EVENT_DRAG, this.mdrg);
            this.mouseEvents.listen(this.mouseEvents.EVENT_MOVE, this.mmve);
            this.mouseEvents.listen(this.mouseEvents.EVENT_LEAVE, this.mlve);
            this.mouseEvents.listen(this.mouseEvents.EVENT_CLICK, this.mcl);
            this.mouseEvents.listen(this.mouseEvents.EVENT_RCLICK, this.rcl);
            this.mouseEvents.listen(this.mouseEvents.EVENT_DBLCLICK, this.mdbl);
            this.mouseEvents.listen(this.mouseEvents.EVENT_WHEEL, this.mw);
            Q.listen(this.container, "keydown", this.kd)
        }
        Z.prototype.addWhiteList = function(aa) {
            return this.mouseEvents.addWhiteList(aa)
        };
        Z.prototype.remove = function() {
            this.mouseEvents.remove();
            return Q.unlisten(this.container, "keydown", this.kd)
        };
        Z.prototype.setScaling = function(aa, ab) {
            this.mouseEvents.scaleX = aa;
            return this.mouseEvents.scaleY = ab
        };
        Z.prototype.addElement = function(aa) {
            aa.animationPriority = aa.animationPriority || 0;
            this.elements.push(aa);
            this.elementsReverse.splice(0, 0, aa);
            this.animationOrder = this.elements.slice(0);
            this.animationOrder.sort(function(ac, ab) {
                return ab.animationPriority - ac.animationPriority
            });
            return aa
        };
        Z.prototype.removeElement = function(aa) {
            Q.removeFromArray(this.elements, aa);
            Q.removeFromArray(this.animationOrder, aa);
            return Q.removeFromArray(this.elementsReverse, aa)
        };
        Z.prototype.notifySceneChanges = function(aa) {
            if (!Q.hasProperties(aa)) {
                return
            }
            Q.extendDeep(this.sceneChanges, aa);
            return this._requestPaint()
        };
        Z.prototype.addHook = function(ab, aa, ac) {
            if (typeof this.hooks[aa] === "undefined") {
                this.hooks[aa] = []
            }
            return this.hooks[aa].push({obj: ab, callback: ac})
        };
        Z.prototype.hook = function(ah, aa, ae) {
            var ad, ag, ac, af, ab;
            this.chart.log("firing hook", {hook: ah, arg: aa, caller: ae});
            if (this.hooks[ah]) {
                af = this.hooks[ah];
                ab = [];
                for (ag = 0, ac = af.length; ag < ac; ag++) {
                    ad = af[ag];
                    ab.push(ad.callback.call(ad.obj, ah, aa, ae))
                }
                return ab
            }
        };
        Z.prototype.mdwn = function(ab) {
            var aa;
            aa = this._notifyMouseEvent(ab, "PointerDown");
            this.pointerToElement[ab.identifier] = aa;
            this.notifySceneChanges(ab.changes);
            return this.container.focus()
        };
        Z.prototype.mup = function(aa) {
            this._notifyMouseEvent(aa, "PointerUp");
            this.pointerToElement[aa.identifier] = null;
            return this.notifySceneChanges(aa.changes)
        };
        Z.prototype.mdrg = function(ab) {
            var aa;
            aa = this._notifyMouseEvent(ab, "PointerDrag");
            this.pointerToElement[ab.identifier] = aa;
            return this.notifySceneChanges(ab.changes)
        };
        Z.prototype.mmve = function(ab) {
            var aa;
            aa = this._notifyMouseEvent(ab, "PointerMove");
            this.pointerToElement[ab.identifier] = aa;
            return this.notifySceneChanges(ab.changes)
        };
        Z.prototype.mlve = function(aa) {
            this._notifyMouseEvent(aa, "PointerOut");
            return this.notifySceneChanges(aa.changes)
        };
        Z.prototype.mcl = function(aa) {
            this._notifyMouseEvent(aa, "Click");
            return this.notifySceneChanges(aa.changes)
        };
        Z.prototype.rcl = function(aa) {
            this._notifyMouseEvent(aa, "RightClick");
            return this.notifySceneChanges(aa.changes)
        };
        Z.prototype.mdbl = function(aa) {
            this._notifyMouseEvent(aa, "DoubleClick");
            return this.notifySceneChanges(aa.changes)
        };
        Z.prototype.mw = function(aa) {
            this._notifyMouseEvent(aa, "Wheel");
            return this.notifySceneChanges(aa.changes)
        };
        Z.prototype.kd = function(aa) {
            if (!aa.keyCode) {
                aa.keyCode = aa.which
            }
            this._notifyKeyEvent(aa, "KeyDown");
            this.notifySceneChanges(aa.changes);
            if (aa.consumed) {
                return aa.preventDefault()
            }
        };
        Z.prototype._notifyMouseEvent = function(aa, ab) {
            var ai, ad, aj, ag, af, ak, ac, ah, ae;
            aa.changes = {};
            aa.consumed = false;
            aa.cursor = null;
            aj = "preview" + ab;
            ah = this.elementsReverse;
            for (ag = 0, ak = ah.length; ag < ak; ag++) {
                ai = ah[ag];
                if (ai[aj] != null) {
                    ai[aj].call(ai, aa)
                }
            }
            aj = "on" + ab;
            ai = this.pointerToElement[aa.identifier];
            if (ai) {
                if (ai[aj] != null) {
                    ai[aj].call(ai, aa);
                    if (aa.consumed) {
                        if (aa.cursor) {
                            this.container.style.cursor = aa.cursor
                        }
                        return ai
                    }
                }
            }
            ad = null;
            ae = this.elementsReverse;
            for (af = 0, ac = ae.length; af < ac; af++) {
                ai = ae[af];
                if (ai[aj] != null) {
                    ai[aj].call(ai, aa);
                    if (aa.consumed) {
                        if (aa.cursor) {
                            this.container.style.cursor = aa.cursor
                        }
                        return ai
                    } else {
                        if ((ad == null) && (aa.cursor != null)) {
                            ad = aa.cursor
                        }
                    }
                }
            }
            this.container.style.cursor = ad;
            return null
        };
        Z.prototype._notifyKeyEvent = function(ad, ab) {
            var ac, ag, af, aa, ae;
            ad.changes = {};
            ad.consumed = false;
            ad.cursor = null;
            ag = "on" + ab;
            ae = this.elementsReverse;
            for (af = 0, aa = ae.length; af < aa; af++) {
                ac = ae[af];
                if (ac[ag] != null) {
                    ac[ag].call(ac, ad);
                    if (ad.consumed) {
                        break
                    }
                }
            }
            return null
        };
        Z.prototype._requestPaint = function() {
            if (!this.paintRequested) {
                q(this._paintScene);
                return this.paintRequested = true
            }
        };
        Z.prototype._paintScene = function() {
            var ak, ad, ab, ai, ah, af, al, ac, aa, aj, ag, ae;
            if (this.chart.removed) {
                return
            }
            this.paintRequested = false;
            ab = new h();
            ab.time = new Date().getTime();
            ab.changes = this.sceneChanges;
            ab["export"] = false;
            this.sceneChanges = {};
            aj = this.elementsReverse;
            for (ai = 0, al = aj.length; ai < al; ai++) {
                ad = aj[ai];
                if (ad.onSceneChange != null) {
                    ad.onSceneChange(ab)
                }
            }
            ab.context = this.prepareContext(ab);
            ag = this.animationOrder;
            for (ah = 0, ac = ag.length; ah < ac; ah++) {
                ak = ag[ah];
                if (ak.doAnimations != null) {
                    ak.doAnimations(ab)
                }
            }
            ae = this.elements;
            for (af = 0, aa = ae.length; af < aa; af++) {
                ak = ae[af];
                if (ak.paintScene != null) {
                    ak.paintScene(ab)
                }
            }
            if (true) {//(ab.animating) { // keren - keep running my coolest red messages!!!
                return this._requestPaint()
            }
        };
        Z.prototype.prepareContext = function(ac) {
            var ab, aa, ad, ae;
            if (ac.changes.bounds) {
                ad = this.chart.scene;
                this.scaleX = Math.min(ad.canvasScaleX, ad.settings.advanced.maxCanvasWidth / ad.chartWidth);
                this.scaleY = Math.min(ad.canvasScaleY, ad.settings.advanced.maxCanvasHeight / ad.chartHeight);
                ae = Math.round(ad.chartWidth * this.scaleX);
                aa = Math.round(ad.chartHeight * this.scaleY);
                this.canvas.width = ae;
                this.canvas.height = aa;
                this.canvas.style.width = "" + ad.chartWidth + "px";
                this.canvas.style.height = "" + ad.chartHeight + "px"
            }
            ab = this.canvas.getContext("2d");
            ab.setTransform(1, 0, 0, 1, 0, 0);
            ab.clearRect(0, 0, this.canvas.width, this.canvas.height);
            ab.setTransform(this.scaleX, 0, 0, this.scaleY, 0, 0);
            return ab
        };
        Z.prototype.exportGetDimensions = function(af) {
            var ae, ab, ad, aa, ag, ah, ac;
            ae = this.scene.getChartBounds();
            ad = ae.right - ae.left;
            ab = ae.bottom - ae.top;
            ac = af.width;
            aa = af.height;
            if (ac > 0 && aa > 0) {
                ah = Math.min(ac / ad, aa / ab)
            } else {
                if (ac > 0) {
                    ah = ac / ad;
                    aa = ab * ah
                } else {
                    if (aa > 0) {
                        ah = aa / ab;
                        ac = ad * ah
                    } else {
                        ah = af.scaling > 0 ? af.scaling : 1;
                        ac = ad * ah * this.scene.canvasScaleX;
                        aa = ab * ah * this.scene.canvasScaleY
                    }
                }
            }
            if (af.unit === "mm") {
                if (af.dpi > 0 && af.width > 0 && af.height > 0) {
                    ag = af.dpi / 25.4;
                    ah *= ag;
                    ac *= ag;
                    aa *= ag
                } else {
                    throw"Invalid export configuration. If unit = mm, dpi, width and height must be supplied"
                }
            }
            return[ac, aa, ah]
        };
        Z.prototype.exportToImage = function(ae, ag, ao) {
            var ah, ad, ab, am, al, aj, af, aq, at, ap, an, ak, aa, ar, ai, ac;
            aq = {png: "image/png", jpeg: "image/jpeg"};
            af = aq[ae];
            ai = this.exportGetDimensions(ag), ak = ai[0], aj = ai[1], at = ai[2];
            ad = document.createElement("canvas");
            ad.width = ak;
            ad.height = aj;
            ab = ad.getContext("2d");
            if (!ao) {
                ab.fillStyle = "#fff";
                ab.fillRect(0, 0, ad.width, ad.height)
            }
            ah = this.scene.getChartBounds();
            ap = at * this.scene.canvasScaleX;
            an = at * this.scene.canvasScaleY;
            ab.setTransform(ap, 0, 0, an, -ah.left * ap, -ah.top * an);
            al = new h();
            al["export"] = true;
            al.time = new Date().getTime();
            al.changes = {};
            al.context = ab;
            ac = this.elements;
            for (aa = 0, ar = ac.length; aa < ar; aa++) {
                am = ac[aa];
                if (am.paintScene != null) {
                    am.paintScene(al)
                }
            }
            return ad.toDataURL(af)
        };
        return Z
    })();
    var w;
    w = (function() {
        function Z(aa) {
            this.scene = aa;
            if (this.scene.settings.credits.enabledOnExport || this.scene.settings.credits.enabled) {
                this.scene.settings.getAssetImage(this.scene.settings.credits.image)
            }
        }
        Z.prototype.paintScene = function(ag) {
            var ac, ae, ab, af, ad, ah, aa;
            ab = ag["export"] ? this.scene.settings.credits.enabledOnExport : this.scene.settings.credits.enabled;
            if (!ab) {
                return
            }
            ad = this.scene.settings.getAssetImage(this.scene.settings.credits.image);
            if (ad && (ad.width || ag["export"])) {
                ah = 3;
                ae = ag.context;
                ae.save();
                ae.setTransform(1, 0, 0, 1, 0, 0);
                ac = ae.canvas;
                aa = ac.width;
                af = ac.height;
                ae.drawImage(ad, aa - ad.width - ah, af - ad.height - ah);
                return ae.restore()
            }
        };
        Z.prototype.onClick = function(aa) {
        };
        return Z
    })();
    var d, Y = {}.hasOwnProperty;
    d = (function() {
        Z.prototype.animationPriority = 0;
        Z.prototype.scene = null;
        Z.prototype.touches = {};
        Z.prototype.text = null;
        Z.prototype.fps = 0;
        Z.prototype.fpsAveragingPeriod = 1000;
        Z.prototype.prevFrame = null;
        function Z(aa) {
            this.scene = aa;
            this.scene.frameCount = 0;
            this.touches = {}
        }
        Z.prototype.paintScene = function(ab) {
            var aj, ad, ak, ai, af, ac, aa, am, ag, al, ah, ae;
            this.scene.frameCount += 1;
            if (this.prevFrame) {
                ad = Math.max(ab.time - this.prevFrame, 1) / 1000;
                ak = 1 / ad;
                aa = Math.min(1, ad * 3);
                this.fps = this.fps * (1 - aa) + ak * aa
            }
            this.prevFrame = ab.time;
            ai = ab.context;
            ai.strokeStyle = "#000";
            ai.fillStyle = "#000";
            // keren
            ai.beginPath();
            ai.lineWidth = "5";
            ai.strokeStyle = "green";
            ai.moveTo(0, 75);
            ai.lineTo(250, 75);
            ai.stroke();
            // end by keren
            ai.beginPath();
            aj = 0;
            ah = this.touches;
            for (af in ah) {
                if (!Y.call(ah, af)) {
                    continue
                }
                am = ah[af];
                aj += 1;
                ai.moveTo(am.dx + 10, am.dy);
                ai.arc(am.dx, am.dy, 10, 0, Math.PI * 2);
                ai.moveTo(am.x + 30, am.y);
                ai.arc(am.x, am.y, 30, 0, Math.PI * 2);
                ai.moveTo(am.dx, am.dy);
                ae = am.trace;
                for (ag = 0, al = ae.length; ag < al; ag++) {
                    ac = ae[ag];
                    ai.lineTo(ac.x, ac.y);
                    ai.arc(ac.x, ac.y, 3, 0, Math.PI * 2)
                }
            }
            ai.stroke();
            ai.textAlign = "start";
            ai.textBaseline = "middle";
            return ai.fillText("FPS: " + (Math.round(this.fps)) + ", touches: " + aj, this.scene.x0 + this.scene.width / 3, 20)
        };
        Z.prototype.previewPointerDown = function(ac) {
            var aa, ab, ad;
            ad = this.touches;
            for (aa in ad) {
                if (!Y.call(ad, aa)) {
                    continue
                }
                ab = ad[aa];
                if (ab.up) {
                    delete this.touches[aa]
                }
            }
            this.touches[ac.identifier] = {dx: ac.x, dy: ac.y, up: false, trace: []};
            return ac.changes.pointers = true
        };
        Z.prototype.previewPointerDrag = function(ab) {
            var aa;
            aa = this.touches[ab.identifier];
            aa.x = ab.x;
            aa.y = ab.y;
            return aa.trace.push({x: aa.x, y: aa.y})
        };
        Z.prototype.previewPointerUp = function(aa) {
            this.touches[aa.identifier].up = true;
            return this.previewPointerDrag(aa)
        };
        return Z
    })();
    var F, Y = {}.hasOwnProperty, m = function(ac, aa) {
        for (var Z in aa) {
            if (Y.call(aa, Z)) {
                ac[Z] = aa[Z]
            }
        }
        function ab() {
            this.constructor = ac
        }
        ab.prototype = aa.prototype;
        ac.prototype = new ab();
        ac.__super__ = aa.prototype;
        return ac
    };
    F = (function(Z) {
        m(aa, Z);
        aa.FlatTheme = {advanced: {themeCSSClass: "DVSL-flat", assets: ["netchart.css"]}};
        aa.defaults = {theme: aa.FlatTheme, data: {format: "JSON", preloaded: null, dataFunction: null, url: null, requestTimeout: 40000, cacheSize: 10000, random: null, randomGridLinkProbability: 0.6, randomNodes: 0, randomLinks: 0, requestMaxUnits: 2, numberOfParralelRequests: 3, preloadNodeLinks: false}, filters: {nodeFilter: null, linkFilter: null, nodeLinksProcessor: null, multilinkProcessor: null}, style: {nodeLabelMinSize: 40, nodeDetailMinZoom: 0.2, linkLabelMinZoom: 3, iconsMinZoom: 0.7, iconSize: 16, iconNodeDistance: 0, iconNodeAngle: -Math.PI / 4, nodeRadiusExtent: [10, 50], linkRadiusExtent: [0.2, 10], nodeAutoScaling: null, linkAutoScaling: null, nodeRules: {}, linkRules: {}, selection: {fillColor: "lightblue", sizeConstant: 5, sizeProportional: 0.2}, node: {fillColor: "#a3ffa3", lineColor: null, lineWidth: null, radius: 4, shadowColor: null, labelLocation: "outside"}, nodeLocked: {}, nodeLabel: {fillColor: "black"}, nodeExpanded: {}, nodeFocused: {fillColor: "orange"}, link: {fillColor: "#6D6", shadowColor: null, fromDecoration: null, toDecoration: null, fromIcons: null, toIcons: null, label: null, radius: 1, strength: 1, dashed: false, toPieValue: 0, toPieColor: null}, linkLabel: {fillColor: "black"}, linkLabelBalloon: {fillColor: "#FFF", lineColor: "gray"}, nodeLabelBalloon: {fillColor: "rgba(255,255,255,0.7)"}, hiddenLinks: {fillColor: "#BBB", lineColor: "#BBB", lineWidth: 1, size: 3}, hoverStyle: {shadowOffsetX: 0, shadowOffsetY: 0, shadowBlur: 12, shadowColor: "blue"}, removedColor: "#EEE"}, layout: {nodeSpacing: 10, multilinkSpacing: 10, layoutMode: "dynamic", layoutFreezeTimeout: 1500, fadeTime: 600, globalLayoutOnChanges: true}, events: {onClick: null, onRightClick: null, onDoubleClick: null, onSelectionChange: null, onHoverChange: null}, interaction: {zooming: {doubleClickZoom: 1.5, zoomExtent: [0.1, 8], autoZoom: true, sensitivity: 1, wheel: true, fingers: true, autoZoomDuration: 500}, selection: {enabled: true, nodesSelectable: true, linksSelectable: true, lockNodesOnMove: true, tolerance: 10}}, navigation: {mode: "showall", initialNodes: null, focusNodeExpansionRadius: 2, numberOfFocusNodes: 3, focusHistoryRelevanceCooldown: 0.6, expandDelay: 400, expandOnClick: true, autoZoomOnFocus: false, nodeAutoExpandFilter: null}, nodeMenu: {enabled: true, buttons: ["hide", "expand", "focus", "lock"], showData: false, contentsFunction: null}, linkMenu: {enabled: true, showData: false, contentsFunction: null}, advanced: {perNodeLoadingIndicator: true, style: {loadingArcStyle: {r: 35, lineColor: "red", lineWidth: 5, location: "corner"}}}, localization: {loadingLabel: "Loading...", closeButton: "Close"}};
        function aa(ab) {
            aa.__super__.constructor.call(this, "netchart");
            this.apply(aa.defaults);
            this.apply(ab)
        }
        aa.prototype.apply = function(ad) {
            var ac, ag, ae, af, ab;
            ac = aa.__super__.apply.call(this, ad);
            if (ad.style) {
                if (ad.style.nodeRules) {
                    af = ad.style.nodeRules;
                    for (ag in af) {
                        ae = af[ag];
                        this.style.nodeRules[ag] = ae
                    }
                }
                if (ad.style.linkRules) {
                    ab = ad.style.linkRules;
                    for (ag in ab) {
                        ae = ab[ag];
                        this.style.linkRules[ag] = ae
                    }
                }
            }
            return ac
        };
        return aa
    })(G);
    var L, i = this, Y = {}.hasOwnProperty;
    L = (function() {
        Z.prototype.container = null;
        Z.prototype.settings = null;
        Z.prototype.scene = null;
        Z.prototype.layers = null;
        Z.prototype.removed = false;
        Z.prototype.previusSizeW = 0;
        Z.prototype.previusSizeH = 0;
        Z.prototype.onAssetsLoaded = function() {
            return Q.error("Need to override onAssetsLoaded")
        };
        Z.prototype.onRemove = function() {
            return Q.error("Need to override onRemove")
        };
        Z.prototype.onSizeChanged = function(ab, aa) {
            return Q.error("Need to override onSizeChanged")
        };
        Z.prototype.onSettingsChanged = function(aa) {
            return Q.error("Need to override onSettingsChanged")
        };
        function Z(aa) {
            var ab = this;
            this.loadAssets = function() {
                return Z.prototype.loadAssets.apply(ab, arguments)
            };
            this.defaultError = function(ac) {
                return Z.prototype.defaultError.apply(ab, arguments)
            };
            this._windowResize = function() {
                return Z.prototype._windowResize.apply(ab, arguments)
            };
            if (!aa.container) {
                throw"Chart container not set"
            }
            if (!(aa.container.nodeType > 0)) {
                throw"Chart container not a dom object"
            }
        }
        Z.prototype.initialize = function(ab) {
            var aa, ae, ad, ac;
            this.api = ab;
            this.eventListeners = {};
            this.eventDelayedCalls = {};
            this.assetsLoaded = true;
            this.loadedAssets = {};
            this.imgAssets = {};
            if (this.settings.advanced.assets != null) {
                this.loadAssets(this.settings.advanced.assets)
            }
            aa = Q.detectBrowser();
            ac = Q.canvasScaling(), ae = ac[0], ad = ac[1];
            if ((this.settings.advanced.highDpi.hasOwnProperty(aa) && this.settings.advanced.highDpi[aa]) || this.settings.advanced.highDpi["default"]) {
                this.scene.canvasScaleX = ae;
                this.scene.canvasScaleY = ad
            } else {
                this.scene.canvasScaleX = 1;
                this.scene.canvasScaleY = 1
            }
            this.container = this.settings.container;
            if (this.container._DVSL_ChartInstance !== void 0 && this.container._DVSL_ChartInstance !== null) {
                this.container._DVSL_ChartInstance.remove()
            }
            this.container._DVSL_ChartInstance = this;
            this.container.appendChild(this.layers.container);
            this.events = new W(this.layers.mouseTrackLayer, this.layers.canvas, this);
            if (this.settings.advanced.trackTouches) {
                this.events.addElement(new d(this.scene))
            }
            Q.listen(window, "resize", this._windowResize);
            return this.api._impl = this
        };
        Z.prototype.updateSettings = function(aa, ac) {
            var ad, ab;
            if (ac == null) {
                ac = null
            }
            this.log("Update Settings, " + (JSON.stringify(aa)));
            ab = Q.clone(this.settings.events);
            ad = this.settings.apply(aa);
            if (this.removed) {
                return
            }
            if (ad.events) {
                this.updateEvents(ab, this.settings.events, this.EVENT_NAMES)
            }
            if (ad.advanced && ad.advanced.assets) {
                this.loadAssets(this.settings.advanced.assets)
            }
            if (ad.width || ad.height || ad.maxWidth || ad.minWidth || ad.minHeight || ad.maxHeight) {
                this.updateSize(true)
            }
            this.onSettingsChanged(ad);
            this.events.notifySceneChanges({settings: true});
            if (ac) {
                return this.notifySettingsChanged(ad, ac)
            }
        };
        Z.prototype.remove = function() {
            this.removed = true;
            this.events.remove();
            this.container.removeChild(this.layers.container);
            this.onRemove();
            this.layers = null;
            this.scene = null;
            this.events = null;
            this.container._DVSL_ChartInstance = void 0;
            return Q.unlisten(window, "resize", this._windowResize)
        };
        Z.prototype._windowResize = function() {
            return this.updateSize(false)
        };
        Z.prototype.updateSize = function(ab) {
            var aa, ac;
            if (ab == null) {
                ab = false
            }
            if (this.removed) {
                return
            }
            ac = this.settings.width;
            aa = this.settings.height;
            if (!ac) {
                ac = Math.max(this.settings.minWidth, Math.min(this.settings.maxWidth, this.layers.container.clientWidth))
            }
            if (!aa) {
                aa = Math.max(this.settings.minHeight, Math.min(this.settings.maxHeight, this.layers.container.clientHeight))
            }
            if (ac !== this.previusSizeW || aa !== this.previusSizeH || ab) {
                this.log("Update size, " + aa + ", " + ac);
                this.previusSizeH = aa;
                this.previusSizeW = ac;
                this.scene.chartHeight = aa;
                this.scene.chartWidth = ac;
                return this.onSizeChanged(ac, aa)
            }
        };
        Z.prototype.on = function(ab, aa) {
            if (!this.eventListeners[ab]) {
                this.eventListeners[ab] = []
            }
            return this.eventListeners[ab].push(aa)
        };
        Z.prototype.off = function(ab, aa) {
            if (this.eventListeners[ab] != null) {
                return Q.removeFromArray(this.eventListeners[ab], aa)
            }
        };
        Z.prototype.updateEvents = function(af, aa, ad) {
            var ac, ae, ab;
            ab = [];
            for (ac in ad) {
                ae = ad[ac];
                if (af[ae] != null) {
                    this.off(ac, af[ae])
                }
                if (aa[ae] != null) {
                    ab.push(this.on(ac, aa[ae]))
                } else {
                    ab.push(void 0)
                }
            }
            return ab
        };
        Z.prototype.notifyHoverChanged = function(aa) {
            return this.dispatchEventParams("hoverChange", this.extendEventParams(aa), null)
        };
        Z.prototype.notifyDoubleClick = function(aa) {
            return this.dispatchEvent("doubleClick", this.extendEventParams(aa), this.defaultDoubleClick)
        };
        Z.prototype.notifyRightClick = function(aa) {
            return this.dispatchEvent("rightClick", this.extendEventParams(aa), this.defaultRightClick)
        };
        Z.prototype.notifyClick = function(aa) {
            return this.dispatchEvent("click", this.extendEventParams(aa), this.defaultClick)
        };
        Z.prototype.dispatchEventParams = function(ac, ag, aa, ab) {
            var ae, ad, af;
            if (ab == null) {
                ab = 0
            }
            if (!(aa || ((this.eventListeners[ac] != null) && this.eventListeners[ac].length > 0))) {
                return{}
            }
            ae = Q.createEvent(ac);
            for (ad in ag) {
                if (!Y.call(ag, ad)) {
                    continue
                }
                af = ag[ad];
                ae[ad] = af
            }
            return this.dispatchEvent(ac, ae, aa, ab)
        };
        Z.prototype.cancelDelayedEvent = function(aa) {
            return this.eventDelayedCalls[aa] = null
        };
        Z.prototype.dispatchEvent = function(ab, aa, ac, ag) {
            var ai, ad, ae, aj, af, ah = this;
            if (ag == null) {
                ag = 0
            }
            if (!(ac || ((this.eventListeners[ab] != null) && this.eventListeners[ab].length > 0))) {
                return
            }
            if (ag > 0) {
                this.eventDelayedCalls[ab] = aa;
                ai = function() {
                    if (ah.eventDelayedCalls[ab] === aa) {
                        return ah.dispatchEvent(ab, aa, ac, 0)
                    }
                };
                setTimeout(ai, ag);
                return aa
            }
            if (this.eventListeners[ab] != null) {
                af = this.eventListeners[ab];
                for (ae = 0, aj = af.length; ae < aj; ae++) {
                    ad = af[ae];
                    this.log("Call user event handler, " + ab);
                    ad.call(this.api, aa)
                }
            }
            if (!aa.defaultPrevented && (ac != null)) {
                this.log("Call default event handler, " + ab);
                ac.call(this.api, aa)
            }
            return aa
        };
        Z.prototype.notifySettingsChanged = function(ab, aa) {
            return this.dispatchEventParams("settingsChange", this.extendEventParams({changes: ab, origin: aa}), null)
        };
        Z.prototype.error = function(ab, aa) {
            return this.dispatchEventParams("error", {message: ab, arg: aa}, this.defaultError)
        };
        Z.prototype.log = function(ab, aa) {
            if (this.settings.advanced.logging) {
                return Q.log(ab, aa)
            }
        };
        Z.prototype.defaultError = function(aa) {
            if (this.settings.events.onError) {
                this.settings.events.onError(aa)
            }
            return Q.error(aa.message, aa.arg ? aa.arg : null)
        };
        Z.prototype.loadAssets = function() {
            var ad, ac, ab, af, aa, ae, ag = this;
            ac = null;
            ae = this.settings.advanced.assets;
            for (af = 0, aa = ae.length; af < aa; af++) {
                ad = ae[af];
                if (!this.loadedAssets.hasOwnProperty(ad)) {
                    ac = ad;
                    break
                }
            }
            if (ac) {
                if (this.assetsLoaded) {
                    this.log("Loading assets")
                }
                this.assetsLoaded = false;
                ab = function(ah) {
                    if (ag.removed) {
                        return
                    }
                    if (!ag.credits) {
                        ag.credits = ag.events.addElement(new w(ag.scene))
                    }
                    ag.loadedAssets[ah] = true;
                    return ag.loadAssets()
                };
                return this.loadAsset(ac, ab)
            } else {
                if (!this.assetsLoaded) {
                    this.log("Chart assets loaded");
                    this.onAssetsLoaded()
                }
                return this.assetsLoaded = true
            }
        };
        Z.prototype.loadAsset = function(ac, af) {
            var ad, ab, aa, ae = this;
            aa = ac.src;
            aa = this.settings.getAssetUrl(ac);
            ab = Q.getExtension(ac);
            if (ab === "css") {
                ad = document.createElement("link");
                ad.setAttribute("rel", "stylesheet");
                ad.setAttribute("href", aa);
                ad.setAttribute("type", "text/css");
                ad.addEventListener("load", function() {
                    return af(ac)
                });
                ad.addEventListener("error", function() {
                    ae.error("Assets: Failed to load asset", ac);
                    return af(ac)
                });
                document.getElementsByTagName("head")[0].appendChild(ad);
                return setTimeout(function() {
                    var ag;
                    if (!ae.loadedAssets.hasOwnProperty(ac) && !ae.imgAssets.hasOwnProperty(ac)) {
                        ae.imgAssets[ac] = true;
                        ag = document.createElement("img");
                        ag.onerror = function() {
                            return af(ac)
                        };
                        return ag.src = aa
                    }
                }, 200)
            } else {
                if (ab === "js") {
                    ad = document.createElement("script");
                    ad.setAttribute("src", aa);
                    ad.setAttribute("type", "text/javascript");
                    ad.addEventListener("load", function() {
                        return af(ac)
                    });
                    ad.addEventListener("error", function() {
                        this.error("Assets: Failed to load asset", ac);
                        return af(ac)
                    });
                    return document.getElementsByTagName("head")[0].appendChild(ad)
                } else {
                    this.error("Assets: Do not know how to load", ac);
                    return af(ac)
                }
            }
        };
        return Z
    })();
    var T;
    T = (function() {
        Z.prototype.chart = null;
        Z.prototype.oh = 0;
        Z.prototype.sy = 0;
        Z.prototype.barVisible = false;
        Z.prototype.resizing = false;
        Z.prototype.enabled = false;
        function Z(aa) {
            this.chart = aa;
            this.scene = this.chart.scene;
            this.layers = this.chart.layers
        }
        Z.prototype.onSceneChange = function(aa) {
            if (Q.hasProp(aa, "changes/settings")) {
                return this.enabled = this.scene.settings.interaction.resizing.enabled
            }
        };
        Z.prototype.onPointerOut = function(aa) {
            if (!this.enabled) {
                return
            }
            return this.hideUI()
        };
        Z.prototype.onPointerMove = function(ab) {
            var aa;
            if (!this.enabled) {
                return
            }
            aa = this.scene.chartHeight - ab.y;
            if (aa < this.scene.settings.interaction.resizing.advanced.resizerHandleVisibilityTolerance) {
                if (!this.barVisible) {
                    this.showUI()
                }
                if (aa < this.scene.settings.interaction.resizing.advanced.resizerHandleEnableTolerance) {
                    ab.consumed = true;
                    return ab.cursor = "ns-resize"
                }
            } else {
                if (this.barVisible) {
                    return this.hideUI()
                }
            }
        };
        Z.prototype.onPointerDown = function(ab) {
            var aa;
            if (!this.enabled) {
                return
            }
            this.sy = ab.y;
            aa = this.scene.chartHeight - ab.y;
            this.resizing = aa < this.scene.settings.interaction.resizing.advanced.resizerHandleEnableTolerance && ab.y <= this.scene.chartHeight;
            if (this.resizing) {
                this.oh = this.scene.chartHeight;
                this.showUI();
                ab.cursor = "ns-resize";
                return ab.consumed = true
            }
        };
        Z.prototype.onDoubleClick = function(ad) {
            var aa, ac, ab;
            if (!this.enabled) {
                return
            }
            this.sy = ad.y;
            aa = this.scene.chartHeight - ad.y;
            if (aa < this.scene.settings.interaction.resizing.advanced.resizerHandleEnableTolerance && ad.y <= this.scene.chartHeight) {
                ad.consumed = true;
                if (this.wasMaximized) {
                    ac = this.originalHeight;
                    this.wasMaximized = false
                } else {
                    this.originalHeight = this.oh;
                    this.wasMaximized = true;
                    ab = Q.getScroll();
                    ac = this.oh + ab[1] + window.innerHeight - ad.pageY - aa - 10
                }
                this.scene.settings.height = Math.min(this.scene.settings.maxHeight, Math.max(this.scene.settings.minHeight, ac));
                return this.chart.updateSize()
            }
        };
        Z.prototype.onPointerDrag = function(aa) {
            if (!this.enabled) {
                return
            }
            if (this.resizing) {
                aa.consumed = true;
                this.wasMaximized = false;
                this.scene.settings.height = Math.min(this.scene.settings.maxHeight, Math.max(this.scene.settings.minHeight, this.oh + (aa.y - this.sy)));
                return this.chart.updateSize()
            }
        };
        Z.prototype.showUI = function() {
            if (this.barVisible) {
                return
            }
            this.barVisible = true;
            return Q.fadeIn(this.layers.resizerBar)
        };
        Z.prototype.hideUI = function() {
            if (!this.barVisible) {
                return
            }
            this.barVisible = false;
            this.resizing = false;
            return Q.fadeOut(this.layers.resizerBar)
        };
        return Z
    })();
    var M;
    M = (function() {
        Z.prototype.animationPriority = 0;
        Z.prototype.scene = null;
        Z.prototype.loadingTime = null;
        function Z(aa) {
            this.chart = aa;
            this.scene = aa.scene
        }
        Z.prototype.doAnimations = function(aa) {
            if (this.scene.loading) {
                return aa.animating = true
            }
        };
        Z.prototype.paintScene = function(ab) {
            var al, aj, ag, an, ao, ae, ad, aa, af, am, ac, ak, ai, ah;
            af = this.scene;
            ad = this.scene.getMessage();
            ae = this.scene.loading;
            if (!ae) {
                this.loadingTime = null
            }
            if (!((ad != null) || ae)) {
                return
            }
            if (this.loadingTime == null) {
                this.loadingTime = ab.time
            }
            aj = this.scene.settings.advanced.style.loadingArcStyle;
            ag = ab.context;
            if (aj.location === "corner") {
                ak = af.x0 + af.width;
                ai = af.y0
            } else {
                ak = af.x0 + af.width / 2;
                ai = af.y0 + af.height / 2
            }
            if (ad != null) {
                x.textStyle(ag, this.scene.settings.advanced.style.messageTextStyle);
                ag.textBaseline = "middle";
                ag.textAlign = "center";
                ao = ag.measureText("M").width * 1.5;
                ac = ag.measureText(ad).width;
                if (aj.location === "corner") {
                    ak -= ac;
                    ai += ao * 1.5
                }
                if (this.scene.loading) {
                    ai -= ao;
                    ah = ai + aj.r + ao
                } else {
                    ah = ai
                }
                ag.fillText(ad, ak, ah)
            }
            if (this.scene.loading) {
                aa = aj.r;
                am = aj.lineWidth;
                if (!ad && aj.location === "corner") {
                    ak -= (aa + am) * 1.2;
                    ai += (aa + am) * 1.2
                }
                ag.save();
                ag.lineCap = "round";
                ag.lineWidth = am;
                al = (ab.time - this.loadingTime) / 700 * Math.PI;
                an = ag.createLinearGradient(ak + aa * Math.cos(al + Math.PI), ai + aa * Math.sin(al + Math.PI), ak + aa * Math.cos(al), ai + aa * Math.sin(al));
                an.addColorStop(0, aj.lineColor);
                an.addColorStop(1, "transparent");
                ag.strokeStyle = an;
                ag.beginPath();
                ag.arc(ak, ai, aa, al, al + Math.PI);
                ag.stroke();
                return ag.restore()
            }
        };
        return Z
    })();
    var t;
    t = (function() {
        Z.prototype.scene = null;
        Z.prototype.events = null;
        Z.prototype.animationPriority = 999;
        function Z(aa) {
            this.chart = aa;
            this.scene = aa.scene;
            this.events = aa.events;
            this.imageCache = {};
            this.multilinks = {}
        }
        Z.prototype.onSceneChange = function(ab) {
            var aa;
            return aa = ab.changes
        };
        Z.prototype.doAnimations = function(aa) {
        };
        Z.prototype.getImage = function(aa) {
            var ab;
            ab = this.imageCache[aa];
            if (!ab) {
                ab = new Image();
                ab.src = this.scene.settings.getAssetUrl(aa);
                this.imageCache[aa] = ab
            }
            if (ab.width > 0) {
                return ab
            } else {
                return null
            }
        };
        Z.prototype.getNodeImage = function(ae) {
            var ab, ac, ad, aa;
            if (!ae.image) {
                return null
            }
            ac = ae.image;
            ad = null;
            if (ae.tintImage && ae.fillColor) {
                ad = ac;
                ac += "##" + ae.fillColor
            }
            if (this.imageCache[ac] == null) {
                if (ad) {
                    aa = this.getImage(ad);
                    if (aa != null) {
                        this.imageCache[ac] = x.applyColorToImage(aa, ae.fillColor, false)
                    }
                } else {
                    this.getImage(ac)
                }
            }
            ab = this.imageCache[ac];
            if ((ab != null) && ab.width) {
                return ab
            } else {
                return null
            }
        };
        Z.prototype.paintScene = function(aa) {
            this.scene.updateMultilinks();
            this.scene.clearModified();
            return aa.animating |= this.doPainting(aa.context, aa.time)
        };
        Z.prototype.getGeometry = function() {
            var ae, ak, am, af, ag, ac, aa, al, aj, ai, ad, ab, an, ah;
            ah = this.scene.toDisplayTransform(), ak = ah[0], ae = ah[1], af = ah[2], am = ah[3];
            ag = this.scene.x0;
            aa = this.scene.x0 + this.scene.width;
            aj = this.scene.y0;
            ad = this.scene.y0 + this.scene.height;
            ac = (ag - ae) / ak;
            al = (aa - ae) / ak;
            ai = (aj - am) / af;
            ab = (ad - am) / af;
            an = this.scene.zoom;
            return[ak, ae, af, am, an, ag, aa, aj, ad, ac, ai, al, ab]
        };
        Z.prototype.doPainting = function(aW, a0) {
            var aQ, aX, aZ, ay, aq, bF, bG, bE, br, aA, az, bp, bc, aD, aV, am, ah, aR, aS, aN, aG, aF, a8, bw, at, bd, bt, bo, bm, be, bl, a1, a6, bf, bD, aC, av, ag, bC, bq, ax, bz, bk, aU, aI, aH, bu, aT, bA, aY, aP, aL, aE, aB, bi, aO, aK, by, bx, bn, bj, aJ, bb, ba, aM, ar, bv, bs, bh, bg, ap, a9, a3, au, af, ae, ad, ac, aw, a7, a5, a4, a2, ab, aa, bB, ao, an, al, ak, aj, ai;
            aQ = Math.PI * 2;
            ay = false;
            bB = this.getGeometry(), aL = bB[0], aP = bB[1], aB = bB[2], aE = bB[3], au = bB[4], bn = bB[5], bb = bB[6], bh = bB[7], a9 = bB[8], bj = bB[9], bg = bB[10], ba = bB[11], a3 = bB[12];
            ao = this.scene.nodes;
            for (af = 0, aw = ao.length; af < aw; af++) {
                a6 = ao[af];
                aU = a6.currentRadius * au;
                if (a6.lineWidth) {
                    aU += a6.lineWidth / 2
                }
                a6.renderRadius = aU
            }
            this.paintSelection(aW);
            aW.textAlign = "center";
            aW.textBaseline = "middle";
            a1 = this.scene.multilinks;
            bd = this.scene.settings.style.linkLabelMinZoom;
            bt = this.scene.settings.layout.multilinkSpacing * au;
            bc = this.scene.settings.style.hiddenLinks;
            bf = this.scene.settings.style.nodeDetailMinZoom;
            bD = this.scene.settings.style.nodeLabelMinSize / 2;
            ag = au > this.scene.settings.style.iconsMinZoom;
            aR = this.scene.settings.style.iconSize / 2;
            am = this.scene.settings.style.iconNodeAngle;
            ah = this.scene.settings.style.iconNodeDistance;
            bk = 2;
            ax = 5;
            bz = 0.1;
            an = this.scene.links;

            // draw links
            for (ae = 0, a7 = an.length; ae < a7; ae++) {
                at = an[ae];
                aK = at.from.x;
                ar = at.from.y;
                aJ = at.to.x;
                ap = at.to.y;
                if (Math.max(aK, aJ) < bj || Math.min(aK, aJ) > ba || Math.max(ar, ap) < bg || Math.min(ar, ap) > a3) {
                    continue
                }
                aK = aK * aL + aP;
                ar = ar * aB + aE;
                aJ = aJ * aL + aP;
                ap = ap * aB + aE;
                aU = Math.max(0.25, at.currentRadius * au * 0.5);
                aI = at.from.renderRadius;
                aH = at.to.renderRadius;
                aA = aJ - aK;
                az = ap - ar;
                a8 = Math.sqrt(aA * aA + az * az);
                aZ = at === this.scene.activeLink || at.from === this.scene.activeNode || at.to === this.scene.activeNode;
                av = aZ || au > bf;
                if (at.toPieValue > 0 && av) {
                    bC = aH + bk;
                    bq = bC + ax + bz * aH;
                    this.paintLinkPie(aW, aJ, ap, bC, bq, at.toPie0, at.toPie1, at.toPieColor);
                    aH = bq
                }
                if (a8 < aI + aH) {
                    continue
                }
                if (av) {
                    br = Math.min(a8 / 3, Math.max(2, aU * 2));
                    if (at.fromDecoration) {
                        aI += br
                    }
                    if (at.toDecoration) {
                        aH += br
                    }
                }
                aN = 1 / a8;
                bG = aA * aN;
                bE = az * aN;
                aK += bG * aI;
                ar += bE * aI;
                aJ -= bG * aH;
                ap -= bE * aH;
                aA = aJ - aK;
                az = ap - ar;
                a8 = a8 - aI - aH;
                aN = 1 / a8;
                bl = at.multiId;
                be = a1[bl];
                if (Q.isArray(be)) {
                    aq = be.length;
                    bi = Math.min(bt, aI, aH);
                    aC = bi * (be.indexOf(at) - (aq - 1) / 2) / (aq - 1);
                    if (at.from.id > at.to.id) {
                        aK += bE * aC;
                        aJ += bE * aC;
                        ar -= bG * aC;
                        ap -= bG * aC
                    } else {
                        aK -= bE * aC;
                        aJ -= bE * aC;
                        ar += bG * aC;
                        ap += bG * aC
                    }
                }

                aW.beginPath();
                if (av) {
                    if (at.fromDecoration) {
                        this.paintLinkDecoration(aW, aK, ar, bG, bE, br, at.fromDecoration, at.fillColor)
                    }
                    if (at.toDecoration) {
                        this.paintLinkDecoration(aW, aJ, ap, -bG, -bE, br, at.toDecoration, at.fillColor)
                    }
                }


                if (at.dashed) {
                    by = aK + bE * aU;
                    bv = ar - bG * aU;
                    bx = aK - bE * aU;
                    bs = ar + bG * aU;
                    bF = Math.max(5, aU * 3);
                    for (aV = ad = 0, al = a8 / bF; ad <= al; aV = ad += 2) {
                        aG = aV * bF;
                        aF = Math.min((aV + 1) * bF, a8);
                        aW.moveTo(by + aG * bG, bv + aG * bE);
                        aW.lineTo(bx + aG * bG, bs + aG * bE); //each link, 3 lines ?
                        aW.lineTo(bx + aF * bG, bs + aF * bE);
                        aW.lineTo(by + aF * bG, bv + aF * bE);
                        aW.closePath();
                    }
                } else {
                    aW.moveTo(aK + bE * aU, ar - bG * aU);
                    aW.lineTo(aK - bE * aU, ar + bG * aU);
                    aW.lineTo(aJ - bE * aU, ap + bG * aU);
                    aW.lineTo(aJ + bE * aU, ap - bG * aU);
                    aW.closePath();
                }


                x.fill(aW, at);
                if (ag) {
                    aW.lineWidth = 1;
                    aW.strokeStyle = at.fillColor;
                    if (at.fromIcons && at.fromIcons.length) {
                        this.paintLinkIcons(aW, aK, ar, bG, bE, a8, aR, at.fromIcons)
                    }
                    if (at.toIcons && at.toIcons.length) {
                        this.paintLinkIcons(aW, aJ, ap, -bG, -bE, a8, aR, at.toIcons)
                    }
                }
                if ((au > bd || aZ) && (at.label != null) && !at.removed) {
                    bA = "" + at.label;
                    if (bA.length > 0) {
                        bo = aK + aA * 0.5;
                        bm = ar + az * 0.5;
                        this.paintLabel(aW, bo, bm, at.label, at.labelStyle, at.labelBackground)
                    }
                }


                var nodeWithNewAtt1 = this.chart.navigator.nodes[at.from.id];
                var nodeWithNewAtt2 = this.chart.navigator.nodes[at.to.id];
                // keren!!!!!!!!!!!!!
                
                var messagefromx;
                var messagefromy;
                var messagetox;
                var messagetoy;

                if (nodeWithNewAtt1) {
                    if (nodeWithNewAtt1.runMovingMessage == true) {

                        aW.beginPath();
                        if (nodeWithNewAtt1.runMovingMessageType == "Worm") {
                            aW.fillStyle = "#FF1C0A"; // red
                        }
                        else {
                            aW.fillStyle = "#2946e6";
                        }

                        // the node wants to send a message to one of its neighbours.
                        if (nodeWithNewAtt1.id1 == at.to.id || nodeWithNewAtt1.id2 == at.to.id) {

                            if (nodeWithNewAtt1.id2 == at.to.id) {
                                messagefromx = aK + bE * aU;
                                messagefromy = ar - bG * aU;
                                messagetox = aJ + bE * aU;
                                messagetoy = ap - bG * aU;
                            }
                            else {
                                messagefromx = aJ + bE * aU;
                                messagefromy = ap - bG * aU;
                                messagetox = aK + bE * aU;
                                messagetoy = ar - bG * aU;
                            }

                            at.runMovingMessageStepX += 0.01;

                            if (at.runMovingMessageStepX <= 1) {
                                var deltaX = messagetox - messagefromx;
                                var deltaY = messagetoy - messagefromy;

                                var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));

                                var directionX = deltaX / distance;
                                var directionY = deltaY / distance;

                                var newX = messagefromx + directionX * (distance * at.runMovingMessageStepX);
                                var newY = messagefromy + directionY * (distance * at.runMovingMessageStepX);

                                //aW.beginPath();
                                aW.arc(newX, newY, aU * 4, 0, 2 * Math.PI); // keren

                                var imageObj = new Image();
                                imageObj.src = "Images/" + nodeWithNewAtt1.runMovingMessageType + ".png";
                                aW.drawImage(imageObj, newX, newY, aU * 20, aU * 20);
                                aW.closePath();
                                aW.fill();
                            }
                            else
                            {
                                nodeWithNewAtt1.runMovingMessage = false;
                                // nodeWithNewAtt2.runMovingMessage = false;
                                at.runMovingMessageStepX = 0.01;
                            }
                        }
                    }
                }

//                if (nodeWithNewAtt2) {
//                    if (nodeWithNewAtt2.runMovingMessage == true) {
//
//                        aW.beginPath();
//                        if (nodeWithNewAtt2.runMovingMessageType == "Worm") {
//                            aW.fillStyle = "#FF1C0A"; // red
//                        }
//                        else {
//                            aW.fillStyle = "#2946e6";
//                        }
//
//                        if (nodeWithNewAtt2.id1 == at.from.id || nodeWithNewAtt2.id2 == at.from.id) {
//
//                            if (nodeWithNewAtt2.id1 == at.from.id) {
//                                messagefromx = aK + bE * aU;
//                                messagefromy = ar - bG * aU;
//                                messagetox = aJ + bE * aU;
//                                messagetoy = ap - bG * aU;
//                            }
//                            else {
//                                messagefromx = aJ + bE * aU;
//                                messagefromy = ap - bG * aU;
//                                messagetox = aK + bE * aU;
//                                messagetoy = ar - bG * aU;
//                            }
//
//                            at.runMovingMessageStepX = at.runMovingMessageStepX + 0.01;
//
//                            if (at.runMovingMessageStepX <= 1) {
//                                var deltaX = messagetox - messagefromx;
//                                var deltaY = messagetoy - messagefromy;
//
//                                var distance = Math.sqrt(Math.pow(deltaX, 2) + Math.pow(deltaY, 2));
//
//                                var directionX = deltaX / distance;
//                                var directionY = deltaY / distance;
//
//                                var newX = messagefromx + directionX * (distance * at.runMovingMessageStepX);
//                                var newY = messagefromy + directionY * (distance * at.runMovingMessageStepX);
//
//                                aW.beginPath();
//                                aW.arc(newX, newY, aU * 4, 0, 2 * Math.PI); // keren
//
//                                var imageObj = new Image();
//                                imageObj.src = "Images/" + nodeWithNewAtt1.runMovingMessageType + ".png";
//                                aW.drawImage(imageObj, newX, newY, 15, 15);
//                                aW.closePath();
//                                aW.fill();
//                            }
//                            else {
//                                //nodeWithNewAtt1.runMovingMessage = false;
//                                nodeWithNewAtt2.runMovingMessage = false;
//                                at.runMovingMessageStepX = 0.1;
//                            }
//                        }
//                    }
//                }


                //aW.closePath();
                //aW.fill();


            }
            // draw nodes
            ak = this.scene.nodes;
            for (ac = 0, a5 = ak.length; ac < a5; ac++) {
                a6 = ak[ac];
                aO = a6.x;
                aM = a6.y;
                bu = a6.renderRadius;
                aU = a6.currentRadius;
                if (aO + bu < bj || aO - bu > ba || aM + bu < bg || aM - bu > a3) {
                    continue
                }
                aO = aO * aL + aP;
                aM = aM * aB + aE;
                aU = aU * au;
                if (a6.highlight) {
                    this.paintHilight(aW, aO, aM, bu, au, a6.highlight)
                }
                if (!a6.removed && au >= bf) {
                    aD = a6.dataLinks.length - a6.links.length;
                    if (aD > 0) {
                        this.paintHiddenLinks(aW, a6, aO, aM, aU, aD, bc, bc.size * au)
                    }
                }


                aW.beginPath();
                aW.moveTo(aO + aU, aM);
                aW.arc(aO, aM, aU, 0, aQ);
                x.paint(aW, a6);
                if (au >= bf || a6.active) {
                    aS = this.getNodeImage(a6);
                    if (aS != null) {
                        if (a6.imageSlicing) {
                            aT = a6.imageSlicing;
                            //aW.drawImage(aS, aT[0], aT[1], aT[2], aT[3], aO - aU - 3, aM - aU - 3, aU * 2.7, aU * 2.7)
                            aW.drawImage(aS, aT[0], aT[1], aS.width, aS.height, aO - aU, aM - aU + 30, aU, aU)
                        } else {
                            aW.drawImage(aS, 0, 0, aS.width, aS.height, (aO - aU), (aM - aU), aU * 2, aU * 2)
                        }
                    }
                    if (!a6.removed) {
                        if (ag && a6.icons && a6.icons.length) {
                            this.paintNodeIcons(aW, aO, aM, aU + ah, am, aR, a6.icons)
                        }
                    }
                }
            }
            if (this.scene.settings.advanced.perNodeLoadingIndicator) {
                aY = this.scene.settings.advanced.style.loadingArcStyle;
                bi = aY.lineWidth;
                aW.save();
                aW.lineCap = "round";
                aW.lineWidth = bi;
                aX = a0 / 1400;
                aX = (aX - Math.floor(aX)) * (Math.PI * 2);
                aj = this.scene.nodes;
                for (ab = 0, a4 = aj.length; ab < a4; ab++) {
                    a6 = aj[ab];
                    if (a6.loading) {
                        ay = true;
                        aO = a6.x * aL + aP;
                        aM = a6.y * aB + aE;
                        aU = a6.currentRadius * au;
                        if (aO - aU < bn || aO + aU > bb || aM - aU < bh || aM + aU > a9) {
                            continue
                        }
                        bp = aW.createLinearGradient(aO + aU * Math.cos(aX + Math.PI), aM + aU * Math.sin(aX + Math.PI), aO + aU * Math.cos(aX), aM + aU * Math.sin(aX));
                        bp.addColorStop(0, aY.lineColor);
                        bp.addColorStop(1, "transparent");
                        aW.strokeStyle = bp;
                        aW.beginPath();
                        aW.arc(aO, aM, aU, aX, aX + Math.PI);
                        aW.stroke()
                    }
                }
                aW.restore()
            }
            x.textStyle(aW, this.scene.settings.style.nodeLabel);
            aW.textAlign = "center";
            aW.textBaseline = "middle";
            bw = aW.measureText("M").width;
            ai = this.scene.nodes;
            for (aa = 0, a2 = ai.length; aa < a2; aa++) {
                a6 = ai[aa];
                if (!((a6.label != null) && !a6.removed && a6.renderRadius > bD)) {
                    continue
                }
                aO = a6.x * aL + aP;
                aM = a6.y * aB + aE;
                if (a6.labelLocation === "inside") {
                    aM += a6.currentRadius * au / 2
                } else {
                    if (a6.labelLocation === "center") {
                        1
                    } else {
                        bu = a6.renderRadius;
                        aM += bu + bw
                    }
                }
                this.paintLabel(aW, aO, aM, a6.label, a6.labelStyle, a6.labelBackground)
            }
            if ((this.scene.activeNode != null) && this.scene.activeNode.label) {
                a6 = this.scene.activeNode;
                aO = a6.x * aL + aP;
                aM = a6.y * aB + aE;
                if (a6.labelLocation === "inside") {
                    aM += a6.currentRadius * au / 2
                } else {
                    if (a6.labelLocation === "center") {
                        1
                    } else {
                        bu = a6.renderRadius;
                        aM += bu + bw
                    }
                }
                this.paintLabel(aW, aO, aM, a6.label, a6.labelStyle, a6.labelBackground)
            }
            return ay
        };
        Z.prototype.paintSelection = function(aJ) {
            var aq, ay, at, ar, af, ae, ax, aw, au, ab, ao, aE, av, ap, aj, ac, aK, aA, am, ai, ah, al, aI, aF, az, aa, ag, ad, aL, aD, aB, aG, aH, an, aC, ak;
            if (!(this.scene.selection.length > 0)) {
                return
            }
            aC = this.getGeometry(), aj = aC[0], ap = aC[1], aK = aC[2], ac = aC[3], aG = aC[4], ai = aC[5], aI = aC[6], ag = aC[7], aD = aC[8], ah = aC[9], ad = aC[10], aF = aC[11], aB = aC[12];
            aq = Math.PI * 2;
            av = this.scene.settings.style.selection;
            ao = av.sizeProportional;
            ay = av.sizeConstant;
            aJ.beginPath();
            ak = this.scene.selection;
            for (aH = 0, an = ak.length; aH < an; aH++) {
                ab = ak[aH];
                aE = (ab.currentRadius * (1 + ao) + ay) * aG;
                if (ab.isNode) {
                    aA = ab.x * aj + ap;
                    az = ab.y * aK + ac;
                    aJ.moveTo(aA + aE, az);
                    aJ.arc(aA, az, aE, 0, aq)
                } else {
                    if (ab.isLink) {
                        aw = ab.from;
                        au = ab.to;
                        am = aw.x * aj + ap;
                        aa = aw.y * aK + ac;
                        al = au.x * aj + ap;
                        aL = au.y * aK + ac;
                        af = am - al;
                        ae = aa - aL;
                        ax = aE / Math.sqrt(af * af + ae * ae);
                        at = af * ax;
                        ar = ae * ax;
                        aJ.moveTo(am + ar, aa - at);
                        aJ.lineTo(am - ar, aa + at);
                        aJ.lineTo(al - ar, aL + at);
                        aJ.lineTo(al + ar, aL - at);
                        aJ.closePath()
                    }
                }
            }
            return x.paint(aJ, av)
        };
        Z.prototype.paintLabel = function(ae, ab, ah, ag, aa, ad) {
            var ac, af;
            x.textStyle(ae, aa);
            af = ae.measureText(ag).width;
            ac = ae.measureText("M").width;
            if (ad != null) {
                ae.beginPath();
                x.strokeBalloon2(ae, ab, ah, af, ac);
                x.paint(ae, ad);
                x.textStyle(ae, aa)
            }
            return ae.fillText(ag, ab, ah)
        };
        Z.prototype.paintLinkDecoration = function(ag, aa, ah, ad, ab, af, ae, ac) {
            ag.fillStyle = ac;
            if (ae === "circle") {
                ag.moveTo(aa + af, ah);
                return ag.arc(aa, ah, af, 0, Math.PI * 2);
            } else {
                if (ae === "arrow") {
                    ag.moveTo(aa - ad * af, ah - ab * af);
                    ag.lineTo(aa + ad * af - ab * af, ah + ab * af + ad * af);
                    return ag.lineTo(aa + ad * af + ab * af, ah + ab * af - ad * af);
                }
            }
        };
        Z.prototype.paintLinkPie = function(af, ai, ah, ag, ae, ac, ab, ad) {
            var aa, aj;
            aa = (ag + ae) / 2;
            aj = ae - ag;
            af.beginPath();
            af.arc(ai, ah, aa, ac, ab);
            return x.paint(af, {lineColor: ad, lineWidth: aj});
        };
        Z.prototype.paintHilight = function(af, aa, ag, ae, ad, ab) {
            var ac;
            ac = Math.PI * 2;
            ae = ae * (1 + ab.sizeProportional) + ab.sizeConstant * ad;
            af.beginPath();
            af.moveTo(aa + ae, ag);
            af.arc(aa, ag, ae, 0, ac);
            return x.paint(af, ab);
        };
        Z.prototype.paintLinkIcons = function(ae, ai, ag, am, al, ad, ac, ak) {
            var aj, af, ab, aa, ah;
            aj = Math.PI * 2;
            ab = Math.max(ac, Math.min(ad / 2 - (ak.length * 2 + 1) * ac, ac * 3));
            ai += am * ab;
            ag += al * ab;
            am *= ac * 2;
            al *= ac * 2;
            for (aa = 0, ah = ak.length; aa < ah; aa++) {
                af = ak[aa];
                this.paintIcon(ae, ai, ag, ac, af);
                ae.beginPath();
                ae.arc(ai, ag, ac, 0, aj);
                ae.stroke();
                ai += am;
                ag += al;
            }
        };
        Z.prototype.paintNodeIcons = function(an, ai, ag, af, ae, aa, aq) {
            var ao, am, ak, ah, al, ad, aj, ap, ac, ar, ab;
            ao = 2 * aa / af;
            al = af * Math.cos(ae);
            aj = af * Math.sin(ae);
            ak = Math.cos(-ao);
            ah = Math.sin(-ao);
            am = 0;
            ab = [];
            for (ac = 0, ar = aq.length; ac < ar; ac++) {
                ap = aq[ac];
                this.paintIcon(an, ai + al, ag + aj, aa, ap);
                ad = al * ak - aj * ah;
                aj = al * ah + aj * ak;
                al = ad;
                am += ao;
                if (am > 3) {
                    break
                } else {
                    ab.push(void 0)
                }
            }
            return ab
        };
        Z.prototype.paintIcon = function(ad, ab, ag, aa, ac) {
            var af, ae;
            af = this.getImage(ac.image);
            if (af) {
                ae = ac.imageSlicing;
                if (ae) {
                    ad.drawImage(af, ae[0], ae[1], ae[2], ae[3], ab - aa, ag - aa, ae[2], ae[3])
                    //ad.drawImage(af, 50, 50, 460, 360)
                } else {
                    ad.drawImage(af, ab - aa, ag - aa)
                }
                ac.x = ab
                ac.y = ag
            }
        };
        Z.prototype.paintHiddenLinks = function(az, au, ao, an, aq, aj, ay, ar) {
            var ab, aB, ai, ax, ae, ak, ap, ah, aC, aw, aa, al, ag, ad, av, at, af, ac, aA, am;
            ab = Math.PI * 2;
            aC = (aq + ar) / aq;
            ap = ar * 0.73 / aq;
            ah = (aq - ar * 0.1) / aq;
            if (au.links.length > 0) {
                ag = 0;
                at = 0;
                am = au.links;
                for (af = 0, aA = am.length; af < aA; af++) {
                    ak = am[af];
                    ag += ak.otherEnd(au).x;
                    at += ak.otherEnd(au).y
                }
                ag = au.x - ag / au.links.length;
                at = au.y - at / au.links.length;
                ae = aq / Math.sqrt(ag * ag + at * at);
                aw = ag * ae;
                ad = at * ae;
            } else {
                aw = aq;
                ad = 0;
            }
            aB = ab / aj / 3;
            al = Math.cos(-aB * (aj - 1) / 2);
            av = Math.sin(-aB * (aj - 1) / 2);
            aa = aw * al - ad * av;
            ad = aw * av + ad * al;
            aw = aa;
            al = Math.cos(aB);
            av = Math.sin(aB);
            az.beginPath();
            for (ax = ac = 1; ac <= aj; ax = ac += 1) {
                az.moveTo(ao + aw, an + ad);
                az.lineTo(ao + aw * aC, an + ad * aC);
                aa = aw * al - ad * av;
                ad = aw * av + ad * al;
                aw = aa
            }
            ai = az.createRadialGradient(ao, an, Math.max(0, aq - ar), ao, an, aq * aC);
            ai.addColorStop(0, ay.lineColor);
            ai.addColorStop(1, "transparent");
            az.strokeStyle = ai;
            az.lineWidth = ay.lineWidth;
            return az.stroke();
        };
        return Z
    })();
    var c;
    c = (function() {
        Z.prototype.animationPriority = 10;
        Z.prototype.node = null;
        Z.prototype.link = null;
        Z.prototype.contents = null;
        Z.prototype.x = 0;
        Z.prototype.y = 0;
        function Z(ab) {
            var aa;
            this.chart = ab;
            this.container = ab.layers.container;
            this.scene = ab.scene;
            this.events = ab.events;
            this.buttons = [];
            this.popup = Q.createDom("div", "NC-bar-info", null, this.container);
            aa = Q.createDom("a", "NC-close", "X", this.popup);
            this.popupValue = Q.createDom("div", null, null, this.popup);
            this.detailsDiv = Q.createDom("div", "NC-bar-details", null, this.popup);
            this.popupActions = Q.createDom("nav", null, null, this.popup);
            this.buildDetailsPanel(this.detailsDiv);
            this.buildCloseButton(aa);
            this.popup.style.position = "absolute";
            this.popup.style.display = "none";
        }
        Z.prototype.doAnimations = function(aa) {
            if (this.node == null) {
                return
            }
            if (((this.node != null) && this.node.removed) || ((this.link != null) && this.link.removed)) {
                return this.hideInfoPopup();
            } else {
                if ((this.node != null) && this.scene.modifiedNodes.hasOwnProperty(this.node.id)) {
                    return this.updateInfoPopup();
                }
            }
        };
        Z.prototype.previewPointerDown = function(aa) {
            return this.hideInfoPopup()
        };
        Z.prototype.previewWheel = function(aa) {
            return this.hideInfoPopup()
        };
        Z.prototype.toggleNodeMenu = function(aa) {
            if (this.node === aa) {
                return this.hideInfoPopup()
            } else {
                return this.showNodeMenu(aa)
            }
        };
        Z.prototype.toggleLinkMenu = function(aa, ac, ab) {
            if (this.link === ab) {
                return this.hideInfoPopup()
            } else {
                return this.showLinkMenu(aa, ac, ab)
            }
        };
        Z.prototype.showNodeMenu = function(aa) {
            if (!this.scene.settings.nodeMenu.enabled) {
                return
            }
            if (this.node === aa) {
                return this.updateInfoPopup()
            } else {
                this.hideInfoPopup();
                return this.showPopup(aa, null)
            }
        };
        Z.prototype.showLinkMenu = function(aa, ac, ab) {
            if (!this.scene.settings.linkMenu.enabled) {
                return
            }
            this.x = aa;
            this.y = ac;
            if (this.link === ab) {
                return this.updateInfoPopup()
            } else {
                this.hideInfoPopup();
                return this.showPopup(null, ab)
            }
        };
        Z.prototype.showPopup = function(ab, aa) {
            this.node = ab;
            this.link = aa;
            if (this.node) {
                this.node.locks += 1
            }
            this.buildButtons();
            this.contents = null;
            this.updateInfoPopup();
            this.popup.style.display = "block";
            this.updateXY()
        };
        Z.prototype.hideInfoPopup = function() {
            if (!this.node && !this.link) {
                return false
            }
            if (this.node) {
                this.node.locks -= 1
            }
            this.node = null;
            this.link = null;
            this.popup.style.display = "none";
            return false
        };
        Z.prototype.updateInfoPopup = function() {
            var ag, ad, ac, ab, ae, aa, af;
            if (this.node != null) {
                aa = this.scene.settings.nodeMenu;
                ae = this.node
            } else {
                aa = this.scene.settings.linkMenu;
                ae = this.link
            }
            if (aa.contentsFunction) {
                ab = this.node;
                ac = this.link;
                ag = function(ah) {
                    if (this.node === ab && this.link === ac) {
                        this.contents = ah;
                        return this.popupValue.innerHTML = ah
                    }
                };
                af = aa.contentsFunction.call(this.chart.api, ae.data, ae, ag);
                if (Q.isString(af)) {
                    ad = af
                } else {
                    if (this.contents === null) {
                        ad = "<small>" + this.scene.settings.localization.loadingLabel + "</small>"
                    } else {
                        ad = this.contents
                    }
                }
            } else {
                ad = ae.label
            }
            if (ad !== this.contents) {
                this.contents = ad;
                this.popupValue.innerHTML = ad
            }
            this.updateButtons();
            if (aa.showData) {
                this.details.innerHTML = JSON.stringify(ae.data, null, "  ");
                return this.detailsDiv.style.display = "block"
            } else {
                return this.detailsDiv.style.display = "none"
            }
        };
        Z.prototype.updateXY = function() {
            var ah, ae, ai, ab, aa, ag, ak, aj, al, ad, ac, af;
            ae = 12;
            if (this.node != null) {
                af = this.scene.toDisplay(this.node.x, this.node.y), ai = af[0], ag = af[1];
                ak = ag - this.node.renderRadius - ae;
                aj = ag + this.node.renderRadius + ae;
                ab = ai - this.node.renderRadius - ae;
                aa = ai + this.node.renderRadius + ae
            } else {
                ak = aj = ag = this.y;
                ab = this.x - ae;
                aa = this.x + ae
            }
            ad = this.scene.x0;
            ac = this.scene.x0 + this.scene.width;
            al = this.popup.offsetWidth;
            ah = this.popup.offsetHeight;
            ag = Math.max(Math.min(ag, this.scene.y0 + this.scene.height - ah), this.scene.y0);
            if (aa + al <= ac) {
                ai = aa
            } else {
                if (ab - al >= ad) {
                    ai = ab - al
                } else {
                    ai = Math.max(ab - al / 2, ad);
                    ag = aj
                }
            }
            this.popup.style.left = ai + "px";
            return this.popup.style.top = ag + "px"
        };
        Z.prototype.buildButtons = function() {
            var af, ac, ag, ae, ab, ad, aa;
            this.popupActions.innerHTML = "";
            this.buttons = [];
            if (this.node != null) {
                ad = this.scene.settings.nodeMenu.buttons;
                aa = [];
                for (ae = 0, ab = ad.length; ae < ab; ae++) {
                    ac = ad[ae];
                    if (ac === "expand") {
                        ag = Q.createDom("a", "NC-button-expand", null, this.popupActions);
                        af = this.updateExpandButton
                    } else {
                        if (ac === "focus") {
                            ag = Q.createDom("a", "NC-button-focus", null, this.popupActions);
                            af = this.updateFocusButton
                        } else {
                            if (ac === "lock") {
                                ag = Q.createDom("a", "NC-button-lock", null, this.popupActions);
                                af = this.updateLockButton
                            } else {
                                if (ac === "hide") {
                                    ag = Q.createDom("a", "NC-button-hide", null, this.popupActions);
                                    af = this.updateHideButton
                                }
                            }
                        }
                    }
                    ag.href = "#";
                    aa.push(this.buttons.push({e: ag, a: af}))
                }
                return aa
            }
        };
        Z.prototype.updateButtons = function() {
            var aa, ad, ab, ac;
            ac = this.buttons;
            for (ad = 0, ab = ac.length; ad < ab; ad++) {
                aa = ac[ad];
                aa.a.call(this, aa.e)
            }
        };
        Z.prototype.updateExpandButton = function(ab) {
            var aa = this;
            if (!this.node.expanded || this.node.dataLinks.length > this.node.links.length) {
                ab.className = "NC-button-expand";
                ab.title = "Expand";
                ab.innerHTML = "Expand";
                return ab.onclick = function() {
                    return aa.chart.expandNode(aa.node.id, 1)
                }
            } else {
                ab.className = "NC-button-collapse";
                ab.title = "Collapse";
                ab.innerHTML = "Collapse";
                return ab.onclick = function() {
                    return aa.chart.collapseNode(aa.node.id)
                }
            }
        };
        Z.prototype.updateFocusButton = function(ab) {
            var aa = this;
            if (this.node.focused) {
                ab.className = "NC-button-unfocus";
                ab.title = "Unfocus";
                ab.innerHTML = "Unfocus";
                return ab.onclick = function() {
                    return aa.chart.removeFocusNode(aa.node.id)
                }
            } else {
                ab.className = "NC-button-focus";
                ab.title = "Focus";
                ab.innerHTML = "Focus";
                return ab.onclick = function() {
                    return aa.chart.addFocusNode(aa.node.id)
                }
            }
        };
        Z.prototype.updateLockButton = function(ab) {
            var aa = this;
            if (this.node.userLock) {
                ab.className = "NC-button-lock";
                ab.title = "Fixed";
                ab.innerHTML = "Fixed";
                return ab.onclick = function() {
                    return aa.chart.unlockNode(aa.node.id)
                }
            } else {
                ab.className = "NC-button-unlock";
                ab.title = "Dynamic";
                ab.innerHTML = "Dynamic";
                return ab.onclick = function() {
                    return aa.chart.lockNode(aa.node.id)
                }
            }
        };
        Z.prototype.updateHideButton = function(ab) {
            var aa = this;
            ab.className = "NC-button-hide";
            ab.title = "Hide";
            ab.innerHTML = "Hide";
            return ab.onclick = function() {
                return aa.chart.hideNode(aa.node.id)
            }
        };
        Z.prototype.buildCloseButton = function(aa) {
            var ab = this;
            aa.title = this.scene.settings.localization.closeButton;
            aa.href = "#";
            return aa.onclick = function() {
                return ab.hideInfoPopup()
            }
        };
        Z.prototype.buildDetailsPanel = function(ac) {
            var aa, ab;
            aa = Q.createDom("small", null, "Technical data", ac);
            this.details = ab = Q.createDom("pre", null, "", ac);
            ab.style.display = "none";
            return aa.onclick = function() {
                if (ab.style.display === "none") {
                    return ab.style.display = "block"
                } else {
                    return ab.style.display = "none"
                }
            }
        };
        return Z
    })();
    var b, i = this, Y = {}.hasOwnProperty, m = function(ac, aa) {
        for (var Z in aa) {
            if (Y.call(aa, Z)) {
                ac[Z] = aa[Z]
            }
        }
        function ab() {
            this.constructor = ac
        }
        ab.prototype = aa.prototype;
        ac.prototype = new ab();
        ac.__super__ = aa.prototype;
        return ac
    };
    b = (function(Z) {
        m(aa, Z);
        "use strict";
        aa.prototype.api = null;
        aa.prototype.renderer = null;
        aa.prototype.scrolling = null;
        aa.prototype.selection = null;
        function aa(ac, ab) {
            var ad = this;
            this.defaultDoubleClick = function(ae) {
                return aa.prototype.defaultDoubleClick.apply(ad, arguments)
            };
            this.defaultRightClick = function(ae) {
                return aa.prototype.defaultRightClick.apply(ad, arguments)
            };
            this.defaultClick = function(ae) {
                return aa.prototype.defaultClick.apply(ad, arguments)
            };
            this.onSizeChanged = function(af, ae) {
                return aa.prototype.onSizeChanged.apply(ad, arguments)
            };
            aa.__super__.constructor.call(this, ac);
            this.settings = new F(ac);
            this.scene = new O();
            this.scene.settings = this.settings;
            this.graph = new e(this);
            this.navigator = new z(this);
            this.scrolling = new J(this);
            this.layout = new B(this);
            this.layers = new I(this, this.scene);
            this.info = new c(this);
            this.scrolling.resetZoom = true;
            this.initialize(ab);
            this.renderer = new t(this);
            this.events.addElement(this.graph);
            this.events.addElement(this.navigator);
            this.events.addElement(this.layout);
            this.events.addElement(this.scrolling);
            this.events.addElement(new g(this));
            this.events.addElement(new A(this));
            this.events.addElement(this.renderer);
            this.events.addElement(new V(this));
            this.events.addElement(new T(this));
            this.events.addElement(new M(this));
            this.events.addElement(this.info);
            this.scene.data = new k(this);
            this.scene.loading = false;
            this.navigator.showInitialNodes();
            this.updateSize();
            this.events.notifySceneChanges({settings: true, data: true, bounds: true});
            this.updateEvents({}, this.settings.events, this.EVENT_NAMES)
        }
        aa.prototype.EVENT_NAMES = {selectionChange: "onSelectionChange", hoverChange: "onHoverChange", click: "onClick", doubleClick: "onDoubleClick", rightClick: "onRightClick", error: "onError", animationDone: "onAnimationDone", settingsChange: "onSettingsChange"};
        aa.prototype.onAssetsLoaded = function() {
            return this.updateSize()
        };
        aa.prototype.onRemove = function() {
            this.layers = null;
            this.renderer = null;
            this.scene.data = null;
            return this.scene = null
        };
        aa.prototype.onSettingsChanged = function(ad) {
            var ac, ab;
            this.layers.updateSettings(ad);
            ac = {};
            ab = ad.navigation && (ad.navigation.mode || ad.navigation.initialNodes);
            if ((ad.data != null) && (ad.data.dataFunction || ad.data.format || (ad.data.units != null))) {
                if (this.scene.data) {
                    this.scene.data.remove()
                }
                this.scene.data = new k(this);
                ac.data = true;
                ab = true
            }
            if (ab) {
                this.navigator.showInitialNodes();
                this.scrolling.resetZoom = true
            }
            if (ad.filters) {
                this.navigator.updateGraph();
                this.graph.updateFilter()
            }
            return this.events.notifySceneChanges(ac)
        };
        aa.prototype.save = function() {
            var ac, ab;
            ab = this.graph.save();
            ac = this.navigator.save();
            return JSON.stringify({xy: ab, nav: ac})
        };
        aa.prototype.restore = function(ac, ab) {
            var af, ad, ae;
            if (!ac) {
                return
            }
            ad = JSON.parse(ac);
            ae = ad.xy;
            af = ad.nav;
            if (!ae || !af) {
                this.error("Cannt restore state: missing data in state");
                return
            }
            this.navigator.restore(af);
            this.graph.restore(ae);
            return this.scrolling.resetZoom = true
        };
        aa.prototype.onSizeChanged = function(ae, ac) {
            var ab, ad;
            this.scene.height = ac;
            if (this.scene.toolbarHeight) {
                this.scene.y0 = this.scene.toolbarHeight;
                this.scene.height -= this.scene.toolbarHeight
            } else {
                this.scene.y0 = 0
            }
            ab = ac;
            ad = ae;
            this.scene.x0 = 0;
            this.scene.width = ad;
            this.layers.updateSize();
            if (this.events != null) {
                return this.events.notifySceneChanges({bounds: true})
            }
        };
        aa.prototype.reloadData = function() {
            this.scene.data = new k(this);
            return this.events.notifySceneChanges({data: true})
        };
        aa.prototype.lockNode = function(ad, ab, ac) {
            if (Q.isObject(ad)) {
                ad = ad.id
            }
            return this.graph.lockNode(ad, ab, ac)
        };
        aa.prototype.unlockNode = function(ab) {
            if (Q.isObject(ab)) {
                ab = ab.id
            }
            return this.graph.unlockNode(ab)
        };
        aa.prototype.addFocusNode = function(ac, ab) {
            if (Q.isObject(ac)) {
                ac = ac.id
            }
            if (this.settings.navigation.autoZoomOnFocus) {
                this.scene.settings.interaction.zooming.autoZoom = true
            }
            return this.navigator.addFocusNode(ac, ab)
        };
        aa.prototype.clearFocus = function() {
            return this.navigator.clear()
        };
        aa.prototype.removeFocusNode = function(ab) {
            if (Q.isObject(ab)) {
                ab = ab.id
            }
            return this.navigator.unexpandNode(ab)
        };
        aa.prototype.expandNode = function(ac, ab) {
            if (ab == null) {
                ab = 1
            }
            if (Q.isObject(ac)) {
                ac = ac.id
            }
            return this.navigator.expandNode(ac, ab + 1)
        };
        aa.prototype.collapseNode = function(ab) {
            if (Q.isObject(ab)) {
                ab = ab.id
            }
            return this.navigator.collapseNode(ab)
        };
        aa.prototype.uncollapseNode = function(ab) {
            if (Q.isObject(ab)) {
                ab = ab.id
            }
            return this.navigator.uncollapseNode(ab)
        };
        aa.prototype.hideNode = function(ab) {
            if (Q.isObject(ab)) {
                ab = ab.id
            }
            return this.navigator.hideNode(ab)
        };
        aa.prototype.runMovingMessage = function(nodeId1, nodeId2, t) { // keren - this one is really been called
            if (Q.isObject(nodeId1)) {
                nodeId1 = nodeId1.id;
            }
            if (Q.isObject(nodeId2)) {
                nodeId2 = nodeId2.id;
            }
            return this.navigator.runMovingMessage(nodeId1, nodeId2, t);
            //this.graph.runMovingMessage(nodeId1, nodeId2);
        };
        aa.prototype.setSelection = function(ae, ag) {
            var ab, ah, ad, af, ac;
            ad = [];
            for (af = 0, ac = ae.length; af < ac; af++) {
                ah = ae[af];
                if (ah instanceof N || ah instanceof u) {
                    ad.push(ah)
                } else {
                    this.error("SetSelection: Non chart object in selection: " + ah)
                }
            }
            ab = ag | this.scene.selection.length !== ad.length;
            if (ad.length === 1 && !ab) {
                ab = this.scene.selection[0] !== ad[0]
            }
            if (ab) {
                this.scene.selection = ad;
                this.events.notifySceneChanges({selection: true});
                return this.notifySelectionChanged("api")
            }
        };
        aa.prototype.zoomIn = function(ac, ab) {
            return this.error("ZoomIn: not implmeneted")
        };
        aa.prototype.closePopup = function() {
            return this.info.hideInfoPopup()
        };
        aa.prototype.notifySelectionChanged = function(ab) {
            return this.dispatchEventParams("selectionChange", this.extendEventParams({origin: ab}), null)
        };
        aa.prototype.extendEventParams = function(ab) {
            return ab
        };
        aa.prototype.defaultClick = function(ac) {
            var ab;
            if (ac.clickNode != null) {
                ab = ac.clickNode;
                if (!ab.expanded) {
                    if (this.scene.settings.navigation.expandOnClick) {
                        this.expandNode(ab.id);
                        return ac.preventDefault()
                    }
                }
            }
        };
        aa.prototype.defaultRightClick = function(ab) {
            if (ab.clickNode != null) {
                this.scene.data.getNodeLinks(ab.clickNode.id);
                this.info.toggleNodeMenu(ab.clickNode);
                ab.preventDefault()
            }
            if (ab.clickLink != null) {
                this.info.toggleLinkMenu(ab.x, ab.y, ab.clickLink);
                return ab.preventDefault()
            }
        };
        aa.prototype.defaultDoubleClick = function(ac) {
            var ab;
            ab = ac.clickNode;
            if (ab) {
                this.addFocusNode(ab.id);
                return ac.preventDefault()
            }
        };
        return aa
    })(L);
    var S, Y = {}.hasOwnProperty, m = function(ac, aa) {
        for (var Z in aa) {
            if (Y.call(aa, Z)) {
                ac[Z] = aa[Z]
            }
        }
        function ab() {
            this.constructor = ac
        }
        ab.prototype = aa.prototype;
        ac.prototype = new ab();
        ac.__super__ = aa.prototype;
        return ac
    };
    S = (function(Z) {
        m(aa, Z);
        "use strict";
        aa._impl = null;
        aa._scene = null;
        aa.settings = null;
        function aa(ab) {
            this._impl = new b(ab, this);
            this.settings = this._impl.settings;
            this._scene = this._impl.scene;
            return this
        }
        aa.prototype.updateFilters = function() {
            this._impl.updateSettings({filters: {}}, "api");
            return this
        };
        aa.prototype.showNode = function(ab) {
            return this._impl.expandNode(ab, 1)
        };
        aa.prototype.runMovingMessage = function(nodeId1, nodeId2, t) {
            return this._impl.runMovingMessage(nodeId1, nodeId2, t);
        };
        aa.prototype.hideNode = function(ab) {
            return this._impl.hideNode(ab);
        };
        aa.prototype.expandNode = function(ab) {
            return this._impl.expandNode(ab);
        };
        aa.prototype.addFocusNode = function(ac, ab) {
            return this._impl.addFocusNode(ac, ab)
        };
        aa.prototype.removeFocusNode = function(ab) {
            return this._impl.removeFocusNode(ab)
        };
        aa.prototype.clearFocus = function() {
            return this._impl.clearFocus()
        };
        aa.prototype.collapseNode = function(ab) {
            return this._impl.collapseNode(ab)
        };
        aa.prototype.lockNode = function(ad, ab, ac) {
            return this._impl.lockNode(ad, ab, ac)
        };
        aa.prototype.unlockNode = function(ab) {
            return this._impl.unlockNode(ab)
        };
        aa.prototype.selection = function(ab) {
            if (ab != null) {
                this._impl.setSelection(ab)
            }
            return this._scene.selection
        };
        aa.prototype.back = function() {
            return this._impl.back()
        };
        aa.prototype.zoomIn = function(ac, ab) {
            if (ab == null) {
                ab = true
            }
            return this._impl.zoomIn(ac, ab)
        };
        aa.prototype.closePopup = function() {
            return this._impl.closePopup()
        };
        return aa
    })(U);
    this.NetChart = S
}).call(this);