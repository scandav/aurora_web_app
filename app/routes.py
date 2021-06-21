from flask import render_template, jsonify, send_from_directory
import os
from app import app, db
from app.models import PVData, pvdata_schema
from datetime import date, datetime as dt
from sqlalchemy import func, extract

@app.route('/favicon.ico') 
def favicon(): 
    return send_from_directory(os.path.join(app.root_path, 'static'), 'favicon.ico', mimetype='image/vnd.microsoft.icon')

@app.route('/')
def index():
    return render_template("index.html", today_date=date.today())

@app.route('/stats')
def stats():
    
    latest_update = PVData.query \
            .order_by(PVData.created.desc()) \
            .first()
    
    latest_month_records = PVData.query \
            .with_entities(PVData.created, func.max(PVData.nrg_td).label('nrg_td')) \
            .filter(extract('month', PVData.created) == latest_update.created.month) \
            .filter(extract('year', PVData.created) == latest_update.created.year) \
            .group_by(extract('day', PVData.created)) \
            .order_by(PVData.created.asc()) \
            .all()
    # TODO: align computation of produced month and year ? 
    produced_month = sum([a.nrg_td for a in latest_month_records])

    year_records = PVData.query \
                .with_entities(PVData.created, PVData.nrg) \
                .filter(extract('year', PVData.created) == latest_update.created.year) \
                .order_by(PVData.created).all()
    produced_year = year_records[-1].nrg - year_records[0].nrg

    return jsonify({'latest_date': str(latest_update.created), # date of last update
                    'latest_power': latest_update.grid_power, # power in W of last update
                    'peak_value': latest_update.pwr_peak_td, # power peak in W of last update day
                    'day_energy': latest_update.nrg_td, # daily production in Wh of last day
                    'month_energy': produced_month, # monthly production in Wh of last update month
                    'total_energy': latest_update.nrg, # total energy produced overall in Wh
                    'year_energy': produced_year, # year energy produced overall in Wh
                    'year_incentives': app.config['INCENTIVES'] * produced_year / 1000, # total incentives in euro,
                    'month_incentives': app.config['INCENTIVES'] * produced_month / 1000,
                    'operating_days': (dt.today() - dt.strptime(app.config['START_DATE'], '%Y-%m-%d')).days
                    })

@app.route('/daily/<date>')
def daily(date):  
    items = PVData.query \
                    .filter(db.func.date(PVData.created) == date) \
                    .order_by(PVData.created) \
                    .all()
    # print(items)
    return jsonify(pvdata_schema.dump(items, many=True))             

@app.route('/monthly/<date>')
def monthly(date):  
    date = dt.strptime(date, '%Y-%m')
    items = PVData.query \
            .with_entities(PVData.created, func.max(PVData.nrg_td).label('nrg_td')) \
            .filter(extract('month', PVData.created) == date.month) \
            .filter(extract('year', PVData.created) == date.year) \
            .group_by(extract('day', PVData.created)) \
            .all()

    return jsonify(pvdata_schema.dump(items, many=True))       

@app.route('/yearly/<year>')
def yearly(year):  
    sq = PVData.query \
            .with_entities(PVData.created, func.max(PVData.nrg_td).label('nrg_td')) \
            .filter(extract('year', PVData.created) == year) \
            .group_by(extract('month', PVData.created), extract('day', PVData.created)) \
            .subquery()
    items = db.session.query(sq.c.created, func.sum(sq.c.nrg_td).label('nrg_td')) \
            .group_by(extract('month', sq.c.created)) \
            .all()

    return jsonify(pvdata_schema.dump(items, many=True))       
