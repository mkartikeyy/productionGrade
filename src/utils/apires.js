class apires{
    constructor(statuscode, data, message="Success"){
        this.statuscode=statuscode
        this.data=data
        this.messge=message
        this.success=statuscode<400
    }
}