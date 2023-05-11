/**
 * The search algorithm is implemented here
 */


// CONSTANTS

const createEnum = Object.freeze;

const MOVES = createEnum({
    UP: 1,
    DOWN: 2,
    LEFT: 3,
    RIGHT: 4,
});


// HELPER FUNCTIONS


function isPositive(x){
    return x > 0;
}

function isNegative(x){
    return !isPositive(x);
}

function getBoxClassPos(box){
    for(klass of box.classList){
        if(klass.startsWith('b_')) return klass
    }
}


// array
function lastElement(thing){
    return thing[thing.length-1]
}

function delFromArray(array, i){
    return array.splice(i, 1);
}


// randomness

function rand(min, max) {
    // return a random item from min to max (including boundaries)
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function choice(array){
    // return a random item in array
    return array[rand(0, array.length - 1)]
}

function *choices(n, array){
    // return n random items from array
    for(let i=0; i<n; i++){
        yield choice(array);
    }
}

function *unique_choices(n, array){
    if (n > array.length){
        throw Error('n must be less than or the same as length of array');
    }

    new_array = [...array];
    new_array_indices = [...range(array.length)];
    for(let i=0; i<n; i++){
        let c = choice(new_array_indices);
        delFromArray(new_array_indices, new_array_indices.indexOf(c));
        yield new_array[c];
    }
}

function recombine(array){
    // rearrange an array

    return [...unique_choices(array.length, array)];
}


// generators

function *range(start, stop, skip){
    // range function just like Python range function
    if(stop == undefined){
        stop = start;
        start = 0;
    }

    if (skip == undefined){
        skip = 1;
    }

    for(i=start; i<stop; ){
        yield i;
        i+=skip;
    }
}


function* iter(object){
    for(let i=0; i<object.length; i++){
        yield object[i];
    }
}

function* enumerate(object){
    let i=0;
    for(let item of iter(object)){
        yield [i, item];
        i++;
    }
}

function* zip(iter1, iter2){
    iter2 = iter(iter2);
    for(let value1 of iter(iter1)){
        let value2 = iter2.next().value;
        
        yield [value1, value2];
    }
}



// CLASSES


/**
 * Cell Class
 * 
 * Note that the cell class can work also 
 * for any board other than a 9 puzzle board
 * maybe a 18 puzzle board or whatever
 */
class Cell{
    constructor(cellIndex, rows, cols){
        this.cellIndex = cellIndex; //[row, col]
        this.rows = rows;
        this.cols = cols;
    }

    isAtTop(){
        // returns true if cell is at top row
        return this.cellIndex[0] == 0;
    }

    isAtBottom(){
        // returns true if cell is at bottom row
        return this.cellIndex[0] == this.rows - 1;
    }

    isAtFirstCol(){
        // returns true if cell is at first col
        return this.cellIndex[1] == 0;
    }

    isAtLastCol(){
        // returns true if cell is at last col
        return this.cellIndex[1] == this.rows - 1;
    }

    isAtTopOrBottom(){
        // returns true if cell is at top or bottom row
        return this.isAtTop() || this.isAtBottom();
    }

    isAtFirstOrLastCol(){
        // returns true if cell is at first or last col
        return this.isAtFirstCol() || this.isAtLastCol();

    }

    isAtEdge(){
        /**Checkes if cell is at edges
         * | x  -  x |
         * | -  -  - |
         * | x  -  x |
         * returns true if cellrow is first or last and cellcol is first or last
         */

        let [row, col] = this.cellIndex;
        return this.isAtTopOrBottom() && this.isAtFirstOrLastCol();
    }


    isAtSide(){
        /**Checkes if cell is at edges
         * | -  x  - |
         * | x  -  x |
         * | -  x  - |
         * returns true if:
         *      cell is at the first or last col but not at the edges
         *      OR
         *      cell is at the top or bottom row but not at the edges
         */

        return (this.isAtFirstOrLastCol() && !(this.isAtEdge())) ||
                (this.isAtTopOrBottom() && !(this.isAtEdge()));
    }

    
    isSurrounded(){
        /**Checkes if cell is at edges
         * | -  -  - |
         * | -  x  - |
         * | -  -  - |
         * returns true if:
         *      the cell is surrounded by non holes
         *      on all sides
         */

        return !(this.isAtTopOrBottom()) && !(this.isAtFirstOrLastCol());
    }

    isAtTopLeft(){
        // returns true if hole is at top left
        return this.isAtTop() && this.isAtFirstCol();
    }
    isAtTopRight(){
        // returns true if hole is at top right
        return this.isAtTop() && this.isAtFirstCol();
    }
    
    isAtBottomLeft(){
        // returns true if hole is at bottom right
        return this.isAtBottom() && this.isAtFirstCol();
    }
    isAtBottomRight(){
        // returns true if hole is at bottom right
        return this.isAtBottom() && this.isAtLastCol();
    }


    isAtSideTop(){
        return this.isAtSide() && this.isAtTop();
    }
    isAtSideBottom(){
        return this.isAtSide() && this.isAtBottom();
    }

    isAtSideLeft(){
        return this.isAtSide() && this.isAtFirstCol();
    }
    isAtSideRight(){
        return this.isAtSide() && this.isAtLastCol();
    }

    // These methods don't need the dimension of the board

    directlyAboveCell (of){
        // check if this cell is directly above `of`
        const [this_row, this_col] = this.cellIndex;
        const [cell_row, cell_col] = of.cellIndex;

        const rdx = this_row - cell_row;
        return (rdx == 1);
    }


    directlyBelowCell (of){
        // checks if this cell is directly below `of` cell
        const [this_row, this_col] = this.cellIndex;
        const [cell_row, cell_col] = of.cellIndex;

        const rdx = this_row - cell_row;
        return (rdx == -1);
    }

    directlyOnLeft (of){
        const [this_row, this_col] = this.cellIndex;
        const [cell_row, cell_col] = of.cellIndex;

        const cdx = this_col - cell_col;
        return (cdx == -1);
    }

    directlyOnRight (of){
        const [this_row, this_col] = this.cellIndex;
        const [cell_row, cell_col] = of.cellIndex;

        const cdx = this_col - cell_col;
        return (cdx == 1);
    }


    // even more stuff

    inSameCol(with_){
        return this.cellIndex[1] == with_.cellIndex[1];
    }
    
    inSameRow(with_){
        return this.cellIndex[0] == with_.cellIndex[0];
    }

    // 
    validateIndex(index){
        const [row, col] = index;
        if(row < 0 || row > this.rows-1){
            return false;
        }
        if(col < 0 || col > this.cols-1){
            return false
        }
        return true;
    }

    grabSurroundingCells(){
        // grab surrounding cells in a cross like pattern

        const [row, col] = this.cellIndex;
        const _ = index => this.validateIndex(index) ? index : null;

        return {
            top:    _([row-1, col]),
            bottom: _([row+1, col]),
            left:   _([row, col-1]),
            right:  _([row, col+1])
        }
    }
}

/**
 * Hole
 * I like to think of the Hole as the moving object
 * rather than the cells
 */
class Hole extends Cell{

    getMoves(){
        /**
         * I've realised that the order of moves returned might|will have influence on
         * the order of states that a state might birth.
         */
        //edges
        if(this.isAtTopLeft()){
            return [MOVES.RIGHT, MOVES.DOWN];
        }else if(this.isAtTopRight()){
            return [MOVES.LEFT, MOVES.DOWN];
        }else if(this.isAtBottomLeft()){
            return [MOVES.RIGHT, MOVES.UP];
        }else if(this.isAtBottomRight()){
            return [MOVES.LEFT, MOVES.UP];
        }
        //sides
        else if(this.isAtSideLeft()){
            return [MOVES.UP, MOVES.DOWN, MOVES.RIGHT];
        }else if(this.isAtSideRight()){
            return [MOVES.UP, MOVES.DOWN, MOVES.LEFT];
        }else if(this.isAtSideTop()){
            return [MOVES.DOWN, MOVES.LEFT, MOVES.RIGHT];
        }else if(this.isAtSideBottom()){
            return [MOVES.UP, MOVES.LEFT, MOVES.RIGHT];
        }
        //surrounded
        else if(this.isSurrounded()){
            return [MOVES.UP, MOVES.DOWN, MOVES.RIGHT, MOVES.LEFT];
        }
        else{
            // this most likely would not happen
            console.error('NO MOVES WAS RETURNED');
            return [];
        }
    }

    move(cellClicked, onSuccess, onError){
        // input cell was clicked the hole is asked to reponded to it
        if (this.shouldRespondToClick(cellClicked)){
            // move cell
        }else{
            onError('This cell is not movable')
        }
    }

    shouldRespondToClick(cellClicked){
        // whether to respond to a click on a (non hole) cell
        if( !this.sameCell(cellClicked) &&
            (this.directlyAboveCell(cellClicked) || 
            this.directlyBelowCell(cellClicked) ||
            this.directlyOnLeft(cellClicked) ||
            this.directlyOnRight(cellClicked))) {
            // should respond
            return true;
        }
        return false;
    }

    // onMove(){

    // }

    canMove(cell){
        // return true if we can swap cell with hole
        return (
            cell.directlyAboveCell(this) && cell.inSameCol(this) ||
            cell.directlyBelowCell(this) && cell.inSameCol(this) ||
            cell.directlyOnLeft(this) && cell.inSameRow(this)    ||
            cell.directlyOnRight(this) && cell.inSameRow(this)
        );
    }
}



const search = new (function(){
    
    function isNode(value){
        return value.constructor == Node;
    }

    function isState(value){
        return value.constructor == State;
    }

    function isMap(value){
        return value.constructor == Map;
    }

    // Array.prototype.compare = function compare(otherArray){
    //     // check if two arrays contain
    //     return this.map((value, index, _)=>{
    //         if(Array.isArray(value)){
    //             return value.compare(otherArray[index]);
    //         }
    //         return otherArray[index] == value;
    //     });
    // }

    Array.prototype.equals = function equals(otherArray){
        // equality for arrays
        // [1,2,3].equals([1,2,3])
        // 
        // equality for deeply nested arrays 
        // [[]].equals([[]])   // true

        if(!this.length && this.length == otherArray.length){
            return true;
        }
        if(this.length != otherArray.length){
            return false;
        }
        for(let i of range(0, this.length)){
            let [a, b] = [this[i], otherArray[i]];
            if(Array.isArray(a) && Array.isArray(b)){
                if(!a.equals(b)){
                    return false;
                }
            }else{
                if(a !== b){
                    return false;
                }
            }
        }
        return true;
    }

    Array.prototype.notEquals = function notEquals(otherArray){
        return !this.equals(otherArray);
    }

    function copyState(state){
        // return copy: Map() of state: Map()
        // reference to state still exists
        // the copy is thus shallow if keys or values are passed by reference
        const copy = new Map();
        for(let [k, v] of state.entries()){
            copy.set(k, v);
        }
        return copy;
    }

    function createAltState(state){
        // swap keys with values
        return new Map([...zip(state.values(), state.keys())]);
    }


    class State{
        /**
         * Basically a state should just be able to give birth to other states and be comparable with other states
         * 
         * the _state should not change
         * new State() should treated as an immutable object
         */
        
        constructor(state, env, birthMove){
            this._state = copyState(state); // reference to `state` still exists :Map()
            this._env = env;
            this._hole = env.holeDomElem; // :jQuery()
            this.holeCell = new Hole(env.holeIndex, env.rows, env.cols);

            // move that birthed this state
            this.birthMove = birthMove? birthMove: null;
        }
        
        equals(state){
            const s1 = this._state,
                  s2 = state._state;
            
            for (let [cell, s1_index] of s1) {
                let s2_index = s2.get(cell);
                if(s1_index.notEquals(s2_index)){
                    return false;
                }
            }

            return true;
        }

        getPossibleStates(){
            // get hole 
            const holeCell = this.holeCell;
            const states = [];

            for (let move of holeCell.getMoves()) {
                states.push(new State(this.takeAction(move), this._env, move));
            }

            return states;
        }

        takeAction(action){
            // returns resulting state of taking `action` on this state
            // takeAction(action) -> Map()
            const sCells = this.holeCell.grabSurroundingCells();
            
            const s = copyState(this._state),
                  alt = createAltState(s),
                  hold = s.get(this._hole);

            s.birthMove = action;
            
            if (action == MOVES.UP) {
                // move hole up
                s.set(this._hole, sCells.top);
                s.set(alt.get(sCells.top), hold);
                return s;
            }
            if (action == MOVES.DOWN) {
                // move hole down
                s.set(this._hole, sCells.bottom);
                s.set(alt.get(sCells.bottom), hold);
                return s;
            }
            if (action == MOVES.RIGHT) {
                // move hole right
                s.set(this._hole, sCells.right);
                s.set(alt.get(sCells.right), hold);
                return s;
            }
            if (action == MOVES.LEFT) {
                // move hole left
                s.set(this._hole, sCells.left);
                s.set(alt.get(sCells.left), hold);
                return s;
            }
        }
    }
    this.State = State;
    

    class NodeSet{
        // class to carry nodes
        constructor(nodes, parent){
            this.nodes = [];

            if(isState(parent)){
                parent = new Node(parent);
            }

            for (let node of nodes){
                if(isState(node)){
                    node = new Node(node, parent);
                }
                if(!isNode(node)){
                    throw Error('all values of `nodes` must be states or nodes');
                }

                this.nodes.push(node);
            }
        }
    }
    this.NodeSet = NodeSet;


    class Node{
        constructor(state, parent){
            this.state = state; // : State()
            this.parent = parent;
            this.pathCost = 0;
            if(parent){
                parent.pathCost = parent.pathCost + 1;
            }
        }

        equals(node){
            return this.state.equals(node.state);
        }

        expand(){
            // return possible nodes from this node
            return new NodeSet(this.state.getPossibleStates(), parent=this);
        }
    }
    this.Node = Node;


    class StackFrontier{
        constructor(){
            this._nodes = [];
        }

        _add(v){
            this._nodes.push(v);
        }

        add(node){
            // Frontier only accepts nodes

            if(!isNode(node)){
                throw Error('Frontier accepts only nodes');
            }

            if(!this.has(node)){
                this._add(node);
            }
        }

        has(node){
            if(!isNode(node)){
                throw Error('Frontier accepts only nodes');
            }
            
            for(let otherNode of this._nodes){
                if(node.equals(otherNode)) 
                    return true;
            }

            return false;
        }

        pop(){
            return this._nodes.pop();
        }

        get isEmpty(){
            return this._nodes.length == 0;
        }
    }
    this.StackFrontier = StackFrontier;


    class QueueFrontier extends StackFrontier{
        pop(){
            return this._nodes.splice(0, 1, )[0];
        }
    }
    this.QueueFrontier = QueueFrontier;

    class NoSolutionError extends Error{}
    class Solution{}

    class Agent{

        constructor(env){
            this.env = env;
            this.resolved_state = null;
        }

        solve(initialStateMap){
            const frontier = null;
            const explored_set = null;

            // start frontier with initial state
            const initialState = new this.State(initialStateMap, this.env.hole, this.env);
            const node = new Node(initialState);
            frontier.add(node);


            while (true){
                if(frontier.isEmpty){
                    throw NoSolutionError('The goal state could not be found');
                }

                // remove a single node from the frontier
                let node = frontier.pop();

                if(node.equals(goal)){
                    // found solution

                }else{
                    
                    let nodeSet = node.expand();    // expand the node

                    for(node of nodeSet){
                        if(explored_set.has(node))
                            continue
                        
                        frontier.add(node);
                        explored_set.add(node);
                    }
                }
            }
        }
    }
    this.Agent = Agent

})()