<?php

namespace App\Query;

use App\Entity\BusStop;
use App\ViewData\BusStopData;
use App\ViewData\BusStopDataCollection;
use Doctrine\ORM\AbstractQuery;
use Doctrine\ORM\EntityManagerInterface;
use Ramsey\Uuid\Uuid;

class GetAllBusStopsQuery implements QueryInterface
{
    private $entityManager;

    public function __construct(EntityManagerInterface $entityManager)
    {
        $this->entityManager = $entityManager;
    }

    public function __invoke(): BusStopDataCollection
    {
        $queryBuilder = $this->entityManager->createQueryBuilder();
        $queryBuilder->from(BusStop::class, 'busStop');
        $queryBuilder->select(
            'busStop.id',
            'busStop.location',
            'IDENTITY(busStop.group) as group'
        );
        $queryBuilder->groupBy('busStop.id');
        $query = $queryBuilder->getQuery();

        $collection = new BusStopDataCollection();
        foreach ($query->getResult(AbstractQuery::HYDRATE_ARRAY) as $data) {
            $group = $data['group'] ? Uuid::fromString($data['group']) : null;
            $collection->add(new BusStopData($data['id'], $data['location'], $group));
        }
        return $collection;
    }
}