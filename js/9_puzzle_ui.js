/** 9 Puzzle UI
 * 
 * This code controls functions pertaining to the 9 puzzle
 * mechanics
 * 
 * copyrights bigandytechnologies.com
 */



// HELPERS


function swapClasses(swap){ //issues with swapping
    const [k1, k2] = [swap[0].klass, swap[1].klass];
    const [e1, e2] = [swap[1].element, swap[1].element];
    console.log('k1', k1, 'k2', k2);
    e1[0].classList.replace(k1, k2);
    e2[0].classList.replace(k2, k1);
    // e2.removeClass(k2);
    // e1.removeClass(k1);
    // e1.addClass(k2);
    // e2.addClass(k1);
}



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
        this.initialState = null;
        this.currentState = null;
        this.holeDomElem = null;
        // anim
        this.boxHeight = null;
        this.boxWidth = null;
        // agent
        this.agent = null;
        // private
        this._is_configured = true;
    }

    get holeIndex(){
       return this.initialState.get(this.holeDomElem);
    }

    loadState(){
        /** Load resolved state from UI memory
         * 
        * the state loaded is not neccessary the state the user will start
        * interracting from. This is just to make sure the **resolved state**;
        * the current state of the UI is known before hand.
        * 
        * call .configure() to load a state
        * 
        * Note: that the last element of the last row is considered the hole
        *       and that all cells are assumed to arranged properly (as it is considered the resolved state).
        */

        let i = 0;
        let last_element = null;  // so to know the last element after the iteration

        const UIBoxes = new Map();
        const initialState = new Map();

        this.rows = this.cols = 0;

        // get board state
        for(let [row_i, row] of enumerate($(this.puzzle).find('.row'))){
            let s_row = [];
            for (let [col_i, col] of enumerate($(row).find('.col'))){
                
                let box = $(col).find('.box');
                s_row.push(i);

                // experimental setting div[class="box b_i"]
                let ui_class = `b_${i}`;
                box.addClass(ui_class);
                i++;
                
                UIBoxes.set(box, [row_i, col_i]);
                initialState.set(box, [row_i, col_i]);
                box.data('row', row_i);
                box.data('col', col_i);


                // experimental used for swapping animation
                this.boxHeight = box.height();
                this.boxWidth = box.width();

                // set some animation events
                box.on('transitionstart', function(){
                    $(box).addClass('on-transfer');
                })

                box.on('transitionend', function(){
                    $(box).removeClass('on-transfer');
                })

                // set last element
                last_element = box;
                
                // set global dimension
                this.cols = col_i + 1;
            }
            // set global dimension
            this.rows = row_i + 1;
        }

        // the last element is considered to be the hole
        const box = last_element;
        box.addClass('box-hole');
        this.holeDomElem = box;
        
        // state
        // const hole = [2, 2];
        // this.state = new State(state, hole);
        this.currentState = UIBoxes;
        this.initialState = initialState;
    }

    loadAgent(){
        this.agent = new search.Agent(this);
    }

    config(){
        /** Configure the board
         * 
         * For now this is called without arguments so the caller can't reconfigure 
         * the state of the board
         */

        this.bind();
    }

    bind(){
        /**
         * Bind all events
         */

        if(this._is_configured){
            // this.puzzle.find('.box').on('click', function(ev){
            //     const cell = $(ev.target);
            // })
            for(let [domElement, _] of this.currentState){
                domElement.on('click', ()=>{
                    this.swap(domElement);
                });
            }
        }

        this.highlightCells();
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
        cell2.parent().append(cell1.detach());
        hold_parent.append(cell2.detach());

    }

    swap(domElement){
        // swap `domElement` with hole

        const holeIndex = this.currentState.get(this.holeDomElem);
        const index = this.currentState.get(domElement);

        if (domElement == this.holeDomElem || !new Hole(holeIndex).canMove(new Cell(index))) {
            console.log('can not click this cell');
            return;
        }

        this._swap(this.holeDomElem, domElement);
        this.highlightCells()
        // console.log('current hole index', holeIndex);
        // console.log('current other index', index);
        
        // const [rowdx, coldx] = [index[0] - holeIndex[0], index[1] - holeIndex[1]];
        // const [top, right] = [rowdx * this.boxHeight, coldx * this.boxWidgth];

        // // swap positions
        // domElement.addClass('on-transfer');

        // domElement.css({top: -top, right:right, zIndex:500});
        // this.holeDomElem.css({top: top, right: -right});

        // swap classes
        // setTimeout(()=>{
        //     swapClasses([
        //         {element: domElement, klass: getBoxClassPos(domElement[0])},
        //         {element: this.holeDomElem, klass: getBoxClassPos(this.holeDomElem[0])}
        //     ]);
        // }, 1000)

        // swap indexes
        // this.currentState.set(domElement, holeIndex);
        // this.currentState.set(this.holeDomElem, index);

        // swap dom heirarchy
        // const dom_parent = domElement.parent();
        // const hole_parent = this.holeDomElem.parent();

        // domElement.on('transitionend', ()=>{
        //     console.log('touching dom');
        //     const h_p = this.holeDomElem.parent();
        //     domElement.parent().append(this.holeDomElem.detach());
        //     h_p.append(domElement.detach());
            
        //     // reset positions
        //     domElement[0].style.top = null;
        //     domElement[0].style.right = null;
        //     domElement[0].style.zIndex = null;
        //     this.holeDomElem[0].style.top = null;
        //     this.holeDomElem[0].style.right = null;
        //     this.holeDomElem[0].style.zIndex = null;
        // });

        // const h_p = this.holeDomElem.parent();
        // domElement.parent().append(this.holeDomElem.detach());
        // h_p.append(domElement.detach());

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
        for(let cell of this.currentState.keys()){
            let _cell = cell;
            cell = new Cell(this.currentState.get(cell));
            let hole = new Hole(this.currentState.get(this.holeDomElem));
            if(hole.canMove(cell)){
                _cell.addClass('can-transfer');
            }else{
                _cell.removeClass('can-transfer');
            }
        }
    }

    getSolution(){

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