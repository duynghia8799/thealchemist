<?php
class Model extends Zend_Db_Table{
	//normal query
	public function query( $qr ){
		return $this->_db->query( $qr );			
	}
	
	public function lastId(){
		return $this->_db->query("SELECT LAST_INSERT_ID()");
	}
	
	public function get( $tb, $data="" ){
		return $this->_db->fetchAll('SELECT * FROM '.$tb." ".$data);			
	}

	public function queryAll( $qr ){
		return $this->_db->fetchAll( $qr );			
	}
	public function getOne( $tb, $data="" ){
		return $this->_db->fetchRow('SELECT * FROM '.$tb." ".$data);			
	}
	
	public function queryOne( $qr ){
		return $this->_db->fetchRow( $qr );			
	}	
	
	public function getTotal( $tb, $where="" ){
		$total = $this->_db->fetchRow("SELECT COUNT(*) AS total FROM ".$tb." ".$where);
		return $total['total'];
	}
	
	public function insert( $tb, $data ){
		return $this->_db->insert($tb, $data );			
	}

	public function update( $tb, $data, $where ){
		return $this->_db->update($tb, $data, $where );
	}
	
	public function delete( $tb,$where ){
		return $this->_db->delete( $tb, $where );
	}
	
	public function up( $tb, $id, $ord ){
		$one = $this->getOne( $tb, " WHERE ID='$id'");

		if(!$one) return true;
		$ord = $one['ord'];
		if( $ord == 0 ) return true;
		if( isset( $one['parent_id'] ) ){
			$one['parent_id'] = $one['parent_id']!="" ? $one['parent_id']:0;
			//all item with ord == $ord-1 will down
			$this->update( $tb, array(
				ord	=> $ord		
			)," ord='".($ord-1)."' AND parent_id IN(".$one['parent_id'].") AND lang='".$one['lang']."'");
		
			//all item with ord == $ord-1 will down
			$this->update( $tb, array(
				ord	=> $ord-1		
			)," ID='$id'");
		}else{
			//all item with ord == $ord-1 will down
			$this->update( $tb, array(
				ord	=> $ord		
			)," ord='".($ord-1)."' AND lang='".$one['lang']."'");
		
			//all item with ord == $ord-1 will down
			$this->update( $tb, array(
				ord	=> $ord-1		
			)," ID='$id'");
		}
		return true;
	}
	
	public function down( $tb, $id ){
		$one = $this->getOne( $tb, " WHERE ID='$id'");
		if(!$one) return true;
		$ord = $one['ord'];
		if( isset( $one['parent_id']) ){
			$one['parent_id'] = $one['parent_id'] !="" ?$one['parent_id']:0;

			//$total = $this->getTotal( $tb, " WHERE parent_id IN(".$one['parent_id'].") AND lang='".$one['lang']."' AND ID<>".$one['ID']." AND ord >= ".$one['ord'] );
			//if( $total == 0 ) return true;
			
			//all item with ord == $ord-1 will up
			$this->update( $tb, array(
				ord	=> $ord		
			)," ord='".($ord+1)."' AND parent_id IN(".$one['parent_id'].") AND lang='".$one['lang']."'");
		
			//all item with ord == $ord-1 will upn
			$this->update( $tb, array(
				ord	=> $ord+1		
			)," ID='$id'");
		}else{
			//all item with ord == $ord-1 will up
			$this->update( $tb, array(
				ord	=> $ord		
			)," ord='".($ord+1)."' AND lang='".$one['lang']."'");
		
			//all item with ord == $ord-1 will up
			$this->update( $tb, array(
				ord	=> $ord+1		
			)," ID='$id'");
		}
		return true;
	}
	
	/*
		manage write log
	*/
	public function addLog( $msg="", $date ){
		$this->insert("tb_log",array(
			content	=> "<b>{$_SESSION['user']['name']}</b> $msg",
			date		=> $date
		));
	}
	
	public function removeLog( $id=0 ){
		$this->delete("tb_log"," ID='$id'");
	}	
}
?>