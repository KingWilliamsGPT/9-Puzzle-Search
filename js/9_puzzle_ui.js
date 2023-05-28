/** 9 Puzzle UI
 * 
 * This code controls functions pertaining to the 9 puzzle
 * mechanics
 * 
 * copyrights bigandytechnologies.com
 */


// CLASSES

/**
 * Puzzle is the environment for the agent
 * @constructor(puzzle: jQuery)
 *      `puzzle` is a dom element 
 *      the expected dom structure is
 *      .puzzle
 *          .row
 *              .col
 *                  .box
 *              .col
 *                  .box
 *              .col
 *                  .box
 *          .row
 *              .col
 *                  .box
 *          ...
 */
class Puzzle{
    constructor(puzzle){
        this.puzzle = puzzle;
        // state
        this.rows = null;
        this.cols = null;
        this.initialState = null;  // Map()
        this.currentState = null;  // Map()
        this.$holeDomElem = null;
        // agent
        this.agent = null;
        // private
        this._is_configured = true;
    }

    get holeIndex(){
       return this.currentState.get(this.$holeDomElem);
    }
    
    get holeCell(){
        return new Hole(this.holeIndex, this.rows, this.cols);
    }

    get holePos(){
        // this was for debugging
        return {
            topLeft: this.holeCell.isAtTopLeft(),
            topRight: this.holeCell.isAtTopRight(),
            bottomLeft: this.holeCell.isAtBottomLeft(),
            bottomRight: this.holeCell.isAtBottomRight(),
            sideLeft: this.holeCell.isAtSideLeft(),
            sideRight: this.holeCell.isAtSideRight(),
            sideTop: this.holeCell.isAtSideTop(),
            sideBottom: this.holeCell.isAtSideBottom(),
            surrounded: this.holeCell.isSurrounded()
        }
    }

    loadState(){
        /** Loads resolved state from UI memory
         * 
        * the state loaded from the dom is not neccessary the state the user will start 
        * interracting with. 
        * 
        * The state loaded from the dom is assumed to be the resolved state
        */

        const currentState = new Map(); // at first the current state is a copy of the initial state
        const initialState = new Map();
        
        let $last_element = null;
        
        this.rows = this.cols = 0;

        // get board state
        for(let [row_i, row] of enumerate($(this.puzzle).find('.row'))){
            let s_row = [];
            for (let [col_i, col] of enumerate($(row).find('.col'))){
                let $box = $(col).find('.box');
                
                currentState.set($box, [row_i, col_i]);
                initialState.set($box, [row_i, col_i]);

                // set last element
                $last_element = $box;
                
                // set global dimension
                this.cols = col_i + 1;
            }
            // set global dimension
            this.rows = row_i + 1;
        }

        // set hole as last elems
        const $box = $last_element;
        $box.addClass('box-hole');

        this.$holeDomElem = $box;
        
        // state
        this.currentState = currentState;
        this.initialState = initialState;
    }

    loadAgent(){
        try{
           this.agent = new search.Agent(this);
        }catch(e){
            console.error('Agent could not be loaded successfuly');
        }
    }

    config(){
        /** Configure the board
         * 
         * For now this is called without arguments so the caller can't reconfigure 
         * the state of the board
         */

        this.bind();
        this.highlightCells();

        this.loadAgent();
    }

    bind(){
        /**
         * Bind all events
         */

        if(this._is_configured){
            for(let [$domElement, _] of this.currentState){
                $domElement.on('click', ()=>{
                    try{
                        this.swap($domElement); // swap hole with $domElement
                    }catch(e){
                        console.error(e);
                    }
                });
            }
        }

    }
    
    _swap(cell1, cell2){
        // swap any cell[dom element] with any cell[dom element]
        
        const c1_index = this.currentState.get(cell1);
        const c2_index = this.currentState.get(cell2);

        
        // swap indexes
        this.currentState.set(cell1, c2_index);
        this.currentState.set(cell2, c1_index);

        // swap UI's
        const hold_parent = cell1.parent();
        cell2.parent().append(cell1.detach()); // using $.detach() the events are still binded
        hold_parent.append(cell2.detach());

    }

    swap($domElement){
        // swap `$domElement` with hole

        const holeIndex = this.currentState.get(this.$holeDomElem);
        const index = this.currentState.get($domElement);

        if ($domElement == this.$holeDomElem || !new Hole(holeIndex).canMove(new Cell(index))) {
            throw Error('Can not click this cell');
        }

        this._swap(this.$holeDomElem, $domElement);
        this.highlightCells()
    }

    randomiseBoard(){
        const initial_arrangement = [...this.currentState.keys()];
        const final_arrangment = recombine(initial_arrangement);

        for(let cell_i of range(initial_arrangement.length)){
            let [cell1, cell2] = [initial_arrangement[cell_i], final_arrangment[cell_i]];
            this._swap(cell1, cell2);
        }
        console.log('randomizing complete');

        this.highlightCells();
    }

    highlightCells(){
        /**The best, optimal way to highlight necessary cells is by indexing relative to the hole
         * here i'll just lazily loop through all the values. :)
         */
        for(let $cell of this.currentState.keys()){
            let cell = new Cell(this.currentState.get($cell));
            let hole = new Hole(this.currentState.get(this.$holeDomElem));
            if(hole.canMove(cell)){
                $cell.addClass('can-transfer');
            }else{
                $cell.removeClass('can-transfer');
            }
        }
    }

    getSolution(){
        if(this.agent ==  null){
            return console.error('The agent was not loaded');
        }
        
        const solution = this.agent.solve(this.currentState);
        // what to do with solution
    }

    takeAction(action){
        /**Experimental
         * take action while solving the search problem
         */
    }
}


$(function load(){
    console.log('working..');
    const puzzle_elem = $('.puzzle');
    
    puzzle = new Puzzle(puzzle_elem);

    // load board
    puzzle.loadState();

    // configure board
    puzzle.config();

    $('#rb').on('click', ()=>{
        puzzle.randomiseBoard();
    });
    
    $('#sb').on('click', ()=>{
        puzzle.getSolution();
    });
});